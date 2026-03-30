import frappe


def boot_session(bootinfo):

	axon_settings = frappe.get_single("Axon Settings")

	bootinfo.show_axon_chat_on_desk = axon_settings.show_axon_on_desk

	tenor_api_key = axon_settings.tenor_api_key

	document_link_override = frappe.get_hooks("axon_document_link_override")

	if frappe.session.user and frappe.session.user != "Guest":
		chat_style = frappe.db.get_value("Axon User", frappe.session.user, "chat_style")
	else:
		chat_style = "Simple"

	if document_link_override and len(document_link_override) > 0:
		bootinfo.axon_document_link_override = True

	if tenor_api_key:
		bootinfo.tenor_api_key = tenor_api_key
	else:
		bootinfo.tenor_api_key = "AIzaSyAWkuhLwbMxOlvn_o5fxBke1grUZ7F3ma4"  # should we remove this?

	bootinfo.chat_style = chat_style if chat_style else "Simple"

	bootinfo.push_notification_service = (
		axon_settings.push_notification_service
		if axon_settings.push_notification_service
		else "Frappe Cloud"
	)

	if axon_settings.push_notification_service == "Axon":
		bootinfo.vapid_public_key = axon_settings.vapid_public_key
		bootinfo.firebase_client_config = axon_settings.config
