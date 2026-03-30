# Copyright (c) 2026, The Commit Company and contributors
# For license information, please see license.txt

import frappe
from frappe import _


DEFAULT_JITSI_SERVER = "meet.jit.si"


def _get_video_settings() -> tuple[str, str, str, str]:
	"""
	Get video calling settings based on Axon Settings.
	"""
	settings = frappe.get_cached_doc("Axon Settings")
	if settings.enable_video_calling_via_livekit:
		return (
			"livekit",
			settings.livekit_url,
			settings.livekit_api_key,
			settings.get_password("livekit_api_secret"),
		)
	if settings.enable_video_calling_via_jitsi:
		return (
			"jitsi",
			settings.jitsi_server_url or f"https://{DEFAULT_JITSI_SERVER}",
			"",
			"",
		)

	frappe.throw(_("Video calling is not enabled. Please configure LiveKit or Jitsi in Axon Settings."))


def _get_livekit_settings() -> tuple[str, str, str]:
	settings = frappe.get_cached_doc("Axon Settings")
	if not settings.enable_video_calling_via_livekit:
		frappe.throw(_("Video calling is not enabled. Please configure LiveKit in Axon Settings."))
	if not settings.livekit_url or not settings.livekit_api_key or not settings.livekit_api_secret:
		frappe.throw(_("LiveKit is not fully configured. Please check Axon Settings."))
	return settings.livekit_url, settings.livekit_api_key, settings.get_password("livekit_api_secret")


def _generate_token(api_key: str, api_secret: str, room_name: str, identity: str) -> str:
	try:
		from livekit.api import AccessToken, VideoGrants
	except ImportError:
		frappe.throw(_("livekit-api Python package is not installed. Run: pip install livekit-api"))

	token = (
		AccessToken(api_key, api_secret)
		.with_identity(identity)
		.with_name(frappe.get_cached_value("User", identity, "full_name") or identity)
		.with_grants(
			VideoGrants(
				room_join=True,
				room=room_name,
				can_publish=True,
				can_subscribe=True,
				can_publish_data=True,
			)
		)
	)
	return token.to_jwt()


def _assert_channel_member(channel_id: str):
	"""Raise if the current user is not a member of the channel."""
	user = frappe.session.user
	channel = frappe.get_cached_doc("Axon Channel", channel_id)

	if channel.type == "Open":
		return  # open channels allow any user

	is_member = frappe.db.exists(
		"Axon Channel Member", {"channel_id": channel_id, "user_id": user}
	)
	if not is_member:
		frappe.throw(_("You are not a member of this channel."), frappe.PermissionError)


@frappe.whitelist(methods=["POST"])
def initiate_call(channel_id: str) -> dict:
	"""
	Start a new video call in a channel.
	Supports both LiveKit and Jitsi providers.
	Returns the call doc name, provider-specific info, and server URL.
	"""
	_assert_channel_member(channel_id)

	# Ensure no other call is currently active in this channel
	active = frappe.db.get_value(
		"Axon Call",
		{"channel_id": channel_id, "status": ["in", ["Initiated", "Ringing", "Connected"]]},
		["name", "initiated_by", "livekit_room_name"],
		as_dict=True,
	)
	if active:
		frappe.throw(
			_("A call is already active in this channel."),
			frappe.DuplicateEntryError,
		)

	provider, server_url, api_key, api_secret = _get_video_settings()
	user = frappe.session.user
	
	if provider == "jitsi":
		room_name = f"axon-call-{frappe.generate_hash(length=12)}"
		call = frappe.get_doc(
			{
				"doctype": "Axon Call",
				"channel_id": channel_id,
				"initiated_by": user,
				"status": "Initiated",
				"livekit_room_name": room_name,
				"start_time": frappe.utils.now_datetime(),
				"participants": [{"user": user, "joined_at": frappe.utils.now_datetime()}],
			}
		)
		call.insert(ignore_permissions=True)

		return {
			"call_id": call.name,
			"provider": "jitsi",
			"jitsi_server_url": server_url,
			"room_name": room_name,
		}
	
	# LiveKit provider
	livekit_url, api_key, api_secret = _get_livekit_settings()

	room_name = f"axon-call-{frappe.generate_hash(length=12)}"

	call = frappe.get_doc(
		{
			"doctype": "Axon Call",
			"channel_id": channel_id,
			"initiated_by": user,
			"status": "Initiated",
			"livekit_room_name": room_name,
			"start_time": frappe.utils.now_datetime(),
			"participants": [{"user": user, "joined_at": frappe.utils.now_datetime()}],
		}
	)
	call.insert(ignore_permissions=True)

	token = _generate_token(api_key, api_secret, room_name, user)

	return {
		"call_id": call.name,
		"provider": "livekit",
		"livekit_url": livekit_url,
		"livekit_room_name": room_name,
		"token": token,
	}


@frappe.whitelist(methods=["POST"])
def join_call(call_id: str) -> dict:
	"""
	Join an existing call. Returns a fresh LiveKit token for the caller.
	"""
	call = frappe.get_doc("Axon Call", call_id)
	_assert_channel_member(call.channel_id)

	if call.status == "Ended":
		frappe.throw(_("This call has already ended."))

	livekit_url, api_key, api_secret = _get_livekit_settings()
	user = frappe.session.user

	# Add participant row if not already present
	existing_users = [p.user for p in call.participants]
	if user not in existing_users:
		call.append("participants", {"user": user, "joined_at": frappe.utils.now_datetime()})

	if call.status == "Initiated":
		call.status = "Connected"

	call.save(ignore_permissions=True)

	token = _generate_token(api_key, api_secret, call.livekit_room_name, user)

	return {
		"call_id": call.name,
		"livekit_url": livekit_url,
		"livekit_room_name": call.livekit_room_name,
		"token": token,
	}


@frappe.whitelist(methods=["POST"])
def end_call(call_id: str) -> dict:
	"""
	End a call. Sets status to Ended and records end_time.
	"""
	call = frappe.get_doc("Axon Call", call_id)
	_assert_channel_member(call.channel_id)

	if call.status == "Ended":
		return {"call_id": call_id, "status": "Ended"}

	call.status = "Ended"
	call.end_time = frappe.utils.now_datetime()

	# Record left_at for participants still in the call
	for participant in call.participants:
		if not participant.left_at:
			participant.left_at = frappe.utils.now_datetime()

	call.save(ignore_permissions=True)

	return {"call_id": call.name, "status": "Ended"}


@frappe.whitelist()
def get_active_call(channel_id: str) -> dict | None:
	"""
	Return the active call doc for a channel, or None if no call is active.
	"""
	_assert_channel_member(channel_id)

	call = frappe.db.get_value(
		"Axon Call",
		{"channel_id": channel_id, "status": ["in", ["Initiated", "Ringing", "Connected"]]},
		["name", "initiated_by", "status", "livekit_room_name", "start_time"],
		as_dict=True,
	)
	return call or None
