import frappe
from frappe import _
from frappe.frappeclient import FrappeClient

from axon.axon_cloud_notifications import get_site_name


def sync_invalid_tokens():
	"""
	This function is used to fetch the invalid tokens from Axon Cloud and sync them to the database.
	It runs a loop to fetch the Invalid tokens in batches of 10 from Axon Cloud and deletes them from the database.
	If has_more is true, it will continue to fetch the next batch of tokens.
	If has_more is false, it will break the loop. If there are no invalid tokens or error in fetching the invalid tokens, it will break the loop.
	"""
	axon_settings = frappe.get_single("Axon Settings")

	client = FrappeClient(
		url=axon_settings.push_notification_server_url,
		api_key=axon_settings.push_notification_api_key,
		api_secret=axon_settings.get_password("push_notification_api_secret"),
	)

	batch_size = 10

	site_name = get_site_name()

	while True:
		try:
			response = client.post_api(
				"axon_cloud.api.notification.sync_invalid_tokens",
				params={
					"site_name": site_name,
					"batch_size": batch_size,
				},
			)

			invalid_tokens = response.get("invalid_tokens", [])

			if not invalid_tokens:
				break

			for token_data in invalid_tokens:
				try:
					frappe.db.delete("Axon Push Token", {"fcm_token": token_data.get("invalid_token")})
				except Exception as e:
					frappe.log_error(
						_(f"Failed to delete local token {token_data.get('invalid_token')}: {str(e)}")
					)

			# Check if more tokens exist
			has_more = response.get("has_more", False)
			if not has_more:
				break

		except Exception as e:
			frappe.log_error(_(f"Failed to sync invalid tokens: {str(e)}"))
			break

	return "Invalid tokens synced successfully"
