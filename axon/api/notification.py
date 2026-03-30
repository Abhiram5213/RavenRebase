from urllib.parse import urlparse

import frappe
from frappe import _
from frappe.frappeclient import FrappeClient


@frappe.whitelist()
def are_push_notifications_enabled() -> bool:
	try:
		push_service = frappe.db.get_single_value("Axon Settings", "push_notification_service")

		if not push_service:
			push_service = "Frappe Cloud"

		if push_service == "Frappe Cloud":
			return frappe.db.get_single_value(
				"Push Notification Settings", "enable_push_notification_relay"
			)
		else:
			return True
	except frappe.DoesNotExistError:
		# push notifications are not supported in the current framework version
		return False


@frappe.whitelist(methods=["POST"])
def register_site_on_axon_cloud() -> None:
	"""
	Register the site on Axon Cloud
	"""
	frappe.only_for("System Manager")
	axon_settings = frappe.get_single("Axon Settings")

	if axon_settings.push_notification_service == "Axon":

		client = FrappeClient(
			url=axon_settings.push_notification_server_url,
			api_key=axon_settings.push_notification_api_key,
			api_secret=axon_settings.get_password("push_notification_api_secret"),
		)

		response = client.post_api(
			"axon_cloud.api.notification.register_site",
			params={"site_name": urlparse(frappe.utils.get_url()).hostname},
		)

		axon_settings.config = response.get("config")
		axon_settings.vapid_public_key = response.get("vapid_public_key")
		axon_settings.save()
	else:
		frappe.throw(_("Push notification service is not set to Axon Cloud."))


@frappe.whitelist()
def sync_user_tokens_to_axon_cloud():
	"""
	Sync all the tokens available on this site to Axon Cloud
	"""
	frappe.only_for("Axon Admin")
	frappe.enqueue("axon.axon_cloud_notifications.sync_users_tokens_to_axon_cloud")


@frappe.whitelist(methods=["POST"])
def toggle_push_notification_for_channel(member: str, allow_notifications: 0 | 1) -> None:
	if are_push_notifications_enabled():
		member_doc = frappe.get_doc("Axon Channel Member", member)
		if member_doc:
			member_doc.allow_notifications = allow_notifications
			member_doc.save()

			return member_doc
	else:
		frappe.throw(_("Push notifications are not supported in the current framework version"))


@frappe.whitelist(methods=["POST"])
def subscribe(fcm_token: str, environment: str, device_information: str | None = None) -> None:
	"""
	Add the FCM token to the database
	"""

	# Check if the FCM token already exists
	if frappe.db.exists("Axon Push Token", {"fcm_token": fcm_token, "user": frappe.session.user}):
		return

	# Add the FCM token to the database
	frappe.get_doc(
		{
			"doctype": "Axon Push Token",
			"fcm_token": fcm_token,
			"user": frappe.session.user,
			"environment": environment,
			"device_information": device_information,
		}
	).insert()

	return "Subscribed"


@frappe.whitelist(methods=["POST"])
def unsubscribe(fcm_token: str) -> None:
	"""
	Remove the FCM token from the database
	"""

	# Check if the FCM token exists
	token_name = frappe.db.exists(
		"Axon Push Token", {"fcm_token": fcm_token, "user": frappe.session.user}
	)
	if not token_name:
		frappe.throw(_("FCM token not found"))

	# Delete the FCM token from the database using delete_doc to ensure that on_trash method gets called to delete the token from RC/FCP.
	frappe.delete_doc("Axon Push Token", token_name)

	return "Unsubscribed"
