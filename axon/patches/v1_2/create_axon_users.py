import frappe


def execute():
	"""Creating Axon Users for existing users with the "Axon User" role."""

	# In Axon v1.2, we introduced the "Axon User" doctype.
	#  Reference: [#427](https://github.com/The-Commit-Company/Axon/issues/427)
	# This doctype is used to store the user's profile picture and full name.
	# However, existing users with the "Axon User" role will not have a corresponding Axon User record.
	# This patch creates Axon Users for all users with the "Axon User" role.
	users = frappe.get_all(
		"User",
		filters=[["name", "not in", ["Guest"]], ["Has Role", "role", "=", "Axon User"]],
	)

	for user in users:
		if not frappe.db.exists("Axon User", {"user": user.name}):
			axon_user = frappe.new_doc("Axon User")
			axon_user.user = user.name
			axon_user.insert()
