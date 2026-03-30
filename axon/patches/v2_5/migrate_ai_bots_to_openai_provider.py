import frappe


def execute():
	"""
	Migrate existing AI bots to use the new model_provider field
	and enable_openai_services in Axon Settings
	"""
	if frappe.db.get_single_value("Axon Settings", "enable_ai_integration"):
		frappe.db.set_single_value("Axon Settings", "enable_openai_services", 1)

	frappe.db.set_value("Axon Bot", {"is_ai_bot": 1}, "model_provider", "OpenAI")
