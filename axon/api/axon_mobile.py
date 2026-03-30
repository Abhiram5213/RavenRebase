import frappe
from frappe.utils.change_log import get_versions


@frappe.whitelist(allow_guest=True)
def get_client_id():
	"""
	API to fetch the client ID, site name (for socket), App name (for display), Axon version and logo. These will be stored on the device
	"""
	app_name = frappe.get_website_settings("app_name") or frappe.get_system_settings("app_name")

	if not app_name or app_name == "Frappe":
		app_name = "Axon"

	all_app_versions = get_versions()

	app_versions = {k: v["version"] for k, v in all_app_versions.items()}
	axon_version = app_versions["axon"]
	frappe_version = app_versions["frappe"]

	return {
		"client_id": frappe.db.get_single_value("Axon Settings", "oauth_client"),
		"system_timezone": frappe.get_system_settings("time_zone"),
		"app_name": app_name,
		"sitename": frappe.local.site,
		"axon_version": axon_version,
		"frappe_version": frappe_version,
		"logo": frappe.db.get_single_value("Navbar Settings", "app_logo")
		or "/assets/axon/axon-logo.png",
	}


# TODO: API to fetch boot information for the app - settings like GIF API key etc.


@frappe.whitelist(methods=["POST"])
def create_oauth_client():
	"""
	API to create an OAuth Client for the mobile app.
	"""
	axon_settings = frappe.get_doc("Axon Settings")
	existing_oauth_client = axon_settings.oauth_client

	if not existing_oauth_client:
		oauth_client = frappe.new_doc("OAuth Client")
	else:
		oauth_client = frappe.get_doc("OAuth Client", existing_oauth_client)

	oauth_client.app_name = "Axon Mobile"
	oauth_client.scopes = "all openid"
	oauth_client.redirect_uris = "axon.thecommit.company:"
	oauth_client.default_redirect_uri = "axon.thecommit.company:"
	oauth_client.grant_type = "Authorization Code"
	oauth_client.response_type = "Code"
	oauth_client.allowed_roles = []
	oauth_client.append("allowed_roles", {"role": "Axon User"})
	oauth_client.save()
	axon_settings.oauth_client = oauth_client.name
	axon_settings.save()
	return {"message": "OAuth Client created successfully"}
