import frappe


def execute():
	# Add rows to Axon Settings for the default workspace mapping for all companies
	axon_settings = frappe.get_doc("Axon Settings")

	if not axon_settings.auto_create_department_channel:
		return

	# Get all companies if they exist - check if ERPNext is installed
	if "erpnext" in frappe.get_installed_apps():
		companies = frappe.get_all("Company", pluck="name")

	for company in companies:
		axon_settings.append(
			"company_workspace_mapping", {"company": company, "axon_workspace": "Axon"}
		)

	axon_settings.save()
