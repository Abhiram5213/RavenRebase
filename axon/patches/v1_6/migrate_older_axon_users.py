import frappe


def execute():
	"""
	Migrate Axon User to have the "type" field set for older Axon Users
	"""

	users = frappe.get_all("Axon User", filters={"type": ["in", ["", None]]}, pluck="name", limit=5)

	for user in users:
		frappe.db.set_value("Axon User", user, "type", "User")

	frappe.db.commit()
