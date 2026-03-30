# Copyright (c) 2026, The Commit Company and contributors
# For license information, please see license.txt
"""
Integration tests for the LiveKit call API.
Run from your Frappe bench:

    bench run-tests --app axon --module axon.api.test_calls

All tests mock the livekit-api token generation so they work without a real
LiveKit server.  The tests cover:
    - initiate_call
    - join_call
    - end_call
    - get_active_call
    - duplicate call guard
    - non-member access guard
    - Axon Call doctype + realtime event helpers
"""

from unittest.mock import MagicMock, patch

import frappe
from frappe.tests import IntegrationTestCase

from axon.api.calls import end_call, get_active_call, initiate_call, join_call

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

WORKSPACE_NAME = "Public Workspace"
CHANNEL_NAME = "call-test-channel"
CHANNEL_ID = f"{WORKSPACE_NAME}-{CHANNEL_NAME}"

TEST_USER_1 = "test_caller@axon.test"
TEST_USER_2 = "test_joiner@axon.test"

FAKE_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.token"
FAKE_LIVEKIT_URL = "ws://localhost:7880"


def _create_test_users():
	for email in [TEST_USER_1, TEST_USER_2]:
		if not frappe.db.exists("User", email):
			user = frappe.get_doc(
				{
					"doctype": "User",
					"email": email,
					"first_name": email.split("@")[0].replace("_", " ").title(),
					"send_welcome_email": 0,
					"roles": [{"role": "System Manager"}],
				}
			)
			user.insert(ignore_permissions=True)


def _create_open_channel():
	if frappe.db.exists("Axon Channel", CHANNEL_ID):
		return
	channel = frappe.get_doc(
		{
			"doctype": "Axon Channel",
			"channel_name": CHANNEL_NAME,
			"type": "Open",
			"workspace": WORKSPACE_NAME,
		}
	)
	channel.flags.do_not_add_member = True
	channel.insert(ignore_permissions=True)


def _configure_livekit_settings():
	settings = frappe.get_single("Axon Settings")
	settings.enable_video_calling_via_livekit = 1
	settings.livekit_url = FAKE_LIVEKIT_URL
	settings.livekit_api_key = "devkey"
	settings.livekit_api_secret = "secret"
	settings.save(ignore_permissions=True)


def _cleanup_calls():
	for call in frappe.get_all("Axon Call", filters={"channel_id": CHANNEL_ID}):
		frappe.delete_doc("Axon Call", call.name, ignore_permissions=True, force=True)


# ---------------------------------------------------------------------------
# Patch target for LiveKit token generation
# ---------------------------------------------------------------------------

PATCH_TARGET = "axon.api.calls._generate_token"


# ---------------------------------------------------------------------------
# Test class
# ---------------------------------------------------------------------------


class TestCallsAPI(IntegrationTestCase):
	"""Integration tests for axon.api.calls"""

	def setUp(self):
		frappe.set_user("Administrator")
		_create_test_users()
		_create_open_channel()
		_configure_livekit_settings()
		_cleanup_calls()
		frappe.db.commit()  # nosemgrep

	def tearDown(self):
		_cleanup_calls()
		frappe.set_user("Administrator")
		# Restore LiveKit settings to disabled so other tests are not affected
		settings = frappe.get_single("Axon Settings")
		settings.enable_video_calling_via_livekit = 0
		settings.save(ignore_permissions=True)
		frappe.db.commit()  # nosemgrep

	# ------------------------------------------------------------------
	# 1. initiate_call
	# ------------------------------------------------------------------

	@patch(PATCH_TARGET, return_value=FAKE_TOKEN)
	def test_initiate_call_creates_doc(self, _mock_token):
		"""initiate_call should create an Axon Call doc and return token + room name."""
		frappe.set_user(TEST_USER_1)

		result = initiate_call(CHANNEL_ID)

		self.assertIn("call_id", result)
		self.assertIn("token", result)
		self.assertIn("livekit_room_name", result)
		self.assertIn("livekit_url", result)
		self.assertEqual(result["token"], FAKE_TOKEN)
		self.assertEqual(result["livekit_url"], FAKE_LIVEKIT_URL)

		# Verify the doc was persisted
		call = frappe.get_doc("Axon Call", result["call_id"])
		self.assertEqual(call.channel_id, CHANNEL_ID)
		self.assertEqual(call.initiated_by, TEST_USER_1)
		self.assertEqual(call.status, "Initiated")
		self.assertIsNotNone(call.livekit_room_name)

		# Initiator should be in the participants table
		participant_users = [p.user for p in call.participants]
		self.assertIn(TEST_USER_1, participant_users)

	@patch(PATCH_TARGET, return_value=FAKE_TOKEN)
	def test_initiate_call_duplicate_raises(self, _mock_token):
		"""A second initiate_call on the same channel should raise DuplicateEntryError."""
		frappe.set_user(TEST_USER_1)
		initiate_call(CHANNEL_ID)

		with self.assertRaises(frappe.DuplicateEntryError):
			initiate_call(CHANNEL_ID)

	def test_initiate_call_livekit_disabled_raises(self):
		"""Should raise if LiveKit is not enabled in settings."""
		settings = frappe.get_single("Axon Settings")
		settings.enable_video_calling_via_livekit = 0
		settings.save(ignore_permissions=True)

		frappe.set_user(TEST_USER_1)
		with self.assertRaises(frappe.ValidationError):
			initiate_call(CHANNEL_ID)

	# ------------------------------------------------------------------
	# 2. join_call
	# ------------------------------------------------------------------

	@patch(PATCH_TARGET, return_value=FAKE_TOKEN)
	def test_join_call_adds_participant(self, _mock_token):
		"""join_call should add a new participant and return a token."""
		frappe.set_user(TEST_USER_1)
		initiated = initiate_call(CHANNEL_ID)
		call_id = initiated["call_id"]

		frappe.set_user(TEST_USER_2)
		result = join_call(call_id)

		self.assertEqual(result["call_id"], call_id)
		self.assertEqual(result["token"], FAKE_TOKEN)

		call = frappe.get_doc("Axon Call", call_id)
		self.assertEqual(call.status, "Connected")
		participant_users = [p.user for p in call.participants]
		self.assertIn(TEST_USER_2, participant_users)

	@patch(PATCH_TARGET, return_value=FAKE_TOKEN)
	def test_join_call_on_ended_call_raises(self, _mock_token):
		"""Joining an ended call should raise a ValidationError."""
		frappe.set_user(TEST_USER_1)
		initiated = initiate_call(CHANNEL_ID)
		call_id = initiated["call_id"]

		# End the call first
		end_call(call_id)

		frappe.set_user(TEST_USER_2)
		with self.assertRaises(frappe.ValidationError):
			join_call(call_id)

	@patch(PATCH_TARGET, return_value=FAKE_TOKEN)
	def test_join_call_idempotent_for_same_user(self, _mock_token):
		"""Joining the same call twice as the same user should not add duplicate participant rows."""
		frappe.set_user(TEST_USER_1)
		initiated = initiate_call(CHANNEL_ID)
		call_id = initiated["call_id"]

		# Join again as the same user
		join_call(call_id)
		join_call(call_id)

		call = frappe.get_doc("Axon Call", call_id)
		participant_users = [p.user for p in call.participants]
		# Should appear only once
		self.assertEqual(participant_users.count(TEST_USER_1), 1)

	# ------------------------------------------------------------------
	# 3. end_call
	# ------------------------------------------------------------------

	@patch(PATCH_TARGET, return_value=FAKE_TOKEN)
	def test_end_call_sets_status_and_timestamps(self, _mock_token):
		"""end_call should set status=Ended, set end_time, and record left_at for participants."""
		frappe.set_user(TEST_USER_1)
		initiated = initiate_call(CHANNEL_ID)
		call_id = initiated["call_id"]

		frappe.set_user(TEST_USER_2)
		join_call(call_id)

		frappe.set_user(TEST_USER_1)
		result = end_call(call_id)

		self.assertEqual(result["status"], "Ended")

		call = frappe.get_doc("Axon Call", call_id)
		self.assertEqual(call.status, "Ended")
		self.assertIsNotNone(call.end_time)

		for participant in call.participants:
			self.assertIsNotNone(participant.left_at)

	@patch(PATCH_TARGET, return_value=FAKE_TOKEN)
	def test_end_call_idempotent(self, _mock_token):
		"""Calling end_call twice should not raise."""
		frappe.set_user(TEST_USER_1)
		initiated = initiate_call(CHANNEL_ID)
		call_id = initiated["call_id"]

		end_call(call_id)
		result = end_call(call_id)  # second call — should not raise
		self.assertEqual(result["status"], "Ended")

	# ------------------------------------------------------------------
	# 4. get_active_call
	# ------------------------------------------------------------------

	def test_get_active_call_returns_none_when_no_call(self):
		"""get_active_call should return None when there is no active call."""
		frappe.set_user(TEST_USER_1)
		result = get_active_call(CHANNEL_ID)
		self.assertIsNone(result)

	@patch(PATCH_TARGET, return_value=FAKE_TOKEN)
	def test_get_active_call_returns_call_data(self, _mock_token):
		"""get_active_call should return the active call doc fields."""
		frappe.set_user(TEST_USER_1)
		initiated = initiate_call(CHANNEL_ID)
		call_id = initiated["call_id"]

		result = get_active_call(CHANNEL_ID)
		self.assertIsNotNone(result)
		self.assertEqual(result["name"], call_id)
		self.assertEqual(result["status"], "Initiated")

	@patch(PATCH_TARGET, return_value=FAKE_TOKEN)
	def test_get_active_call_returns_none_after_end(self, _mock_token):
		"""get_active_call should return None after the call is ended."""
		frappe.set_user(TEST_USER_1)
		initiated = initiate_call(CHANNEL_ID)
		call_id = initiated["call_id"]

		end_call(call_id)

		result = get_active_call(CHANNEL_ID)
		self.assertIsNone(result)

	# ------------------------------------------------------------------
	# 5. Axon Call doctype: realtime event helpers
	# ------------------------------------------------------------------

	@patch("frappe.publish_realtime")
	def test_call_initiated_publishes_realtime_event(self, mock_publish):
		"""after_insert on Axon Call should publish axon:call_initiated to channel room."""
		call = frappe.get_doc(
			{
				"doctype": "Axon Call",
				"channel_id": CHANNEL_ID,
				"initiated_by": TEST_USER_1,
				"status": "Initiated",
				"livekit_room_name": "test-room-events",
				"start_time": frappe.utils.now_datetime(),
			}
		)
		call.insert(ignore_permissions=True)
		frappe.db.commit()  # nosemgrep — needed to trigger after_commit hooks

		# Check that publish_realtime was called with the channel event
		call_args = [args for args, kwargs in mock_publish.call_args_list if args and args[0] == "axon:call_initiated"]
		self.assertTrue(len(call_args) > 0, "axon:call_initiated was not published")

		call.delete(ignore_permissions=True)

	@patch("frappe.publish_realtime")
	def test_call_ended_publishes_realtime_event(self, mock_publish):
		"""Setting status=Ended on an Axon Call should publish axon:call_ended."""
		call = frappe.get_doc(
			{
				"doctype": "Axon Call",
				"channel_id": CHANNEL_ID,
				"initiated_by": TEST_USER_1,
				"status": "Initiated",
				"livekit_room_name": "test-room-end-event",
				"start_time": frappe.utils.now_datetime(),
			}
		)
		call.insert(ignore_permissions=True)

		call.status = "Ended"
		call.end_time = frappe.utils.now_datetime()
		call.save(ignore_permissions=True)
		frappe.db.commit()  # nosemgrep

		call_args = [args for args, kwargs in mock_publish.call_args_list if args and args[0] == "axon:call_ended"]
		self.assertTrue(len(call_args) > 0, "axon:call_ended was not published")

		call.delete(ignore_permissions=True)

	# ------------------------------------------------------------------
	# 6. Permission guard: non-member of Private channel
	# ------------------------------------------------------------------

	@patch(PATCH_TARGET, return_value=FAKE_TOKEN)
	def test_non_member_cannot_initiate_call_in_private_channel(self, _mock_token):
		"""A user who is not a member of a Private channel should not be able to start a call."""
		# Create a private channel
		private_channel_name = "private-call-test"
		private_channel_id = f"{WORKSPACE_NAME}-{private_channel_name}"

		if not frappe.db.exists("Axon Channel", private_channel_id):
			channel = frappe.get_doc(
				{
					"doctype": "Axon Channel",
					"channel_name": private_channel_name,
					"type": "Private",
					"workspace": WORKSPACE_NAME,
				}
			)
			channel.flags.do_not_add_member = True
			channel.insert(ignore_permissions=True)

		try:
			frappe.set_user(TEST_USER_2)
			with self.assertRaises(frappe.PermissionError):
				initiate_call(private_channel_id)
		finally:
			frappe.set_user("Administrator")
			frappe.delete_doc("Axon Channel", private_channel_id, ignore_permissions=True, force=True)
			frappe.db.commit()  # nosemgrep
