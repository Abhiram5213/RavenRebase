# Copyright (c) 2026, The Commit Company and contributors
# For license information, please see license.txt

import frappe
from frappe.tests import IntegrationTestCase


class TestAxonCall(IntegrationTestCase):
	def setUp(self):
		frappe.set_user("Administrator")

	def test_call_doc_creation(self):
		channel = frappe.get_all("Axon Channel", filters={"type": "Open"}, limit=1)
		if not channel:
			self.skipTest("No open channel available for testing")

		call = frappe.get_doc(
			{
				"doctype": "Axon Call",
				"channel_id": channel[0].name,
				"initiated_by": "Administrator",
				"status": "Initiated",
				"livekit_room_name": "test-room-123",
				"start_time": frappe.utils.now_datetime(),
			}
		)
		call.insert(ignore_permissions=True)
		self.assertEqual(call.status, "Initiated")
		self.assertEqual(call.livekit_room_name, "test-room-123")

		call.status = "Ended"
		call.end_time = frappe.utils.now_datetime()
		call.save(ignore_permissions=True)
		self.assertEqual(call.status, "Ended")

		call.delete()
