import click
import frappe
from frappe.desk.page.setup_wizard.setup_wizard import add_all_roles_to, make_records


def after_install():
	try:
		print("Setting up Axon...")
		add_all_roles_to("Administrator")
		create_axon_user_for_administrator()
		create_general_channel()

		click.secho("Thank you for installing Axon!", fg="green")

	except Exception as e:
		BUG_REPORT_URL = "https://github.com/The-Commit-Company/Axon/issues/new"
		click.secho(
			"Installation for Axon failed due to an error."
			" Please try re-installing the app or"
			f" report the issue on {BUG_REPORT_URL} if not resolved.",
			fg="bright_red",
		)
		raise e


def create_axon_user_for_administrator():

	if not frappe.db.exists("Axon User", {"user": "Administrator"}):
		frappe.get_doc(
			{
				"doctype": "Axon User",
				"user": "Administrator",
				"full_name": "Administrator",
				"type": "User",
			}
		).insert(ignore_permissions=True)


def create_general_channel():
	default_workspace = frappe.get_doc(
		{
			"doctype": "Axon Workspace",
			"workspace_name": "Axon",
			"type": "Public",
		}
	)
	default_workspace.insert(ignore_permissions=True)

	# Make all users a member of this workspace and set them as admins
	users = frappe.get_all("Axon User")
	for user in users:
		try:
			frappe.get_doc(
				{
					"doctype": "Axon Workspace Member",
					"workspace": default_workspace.name,
					"user": user.name,
					"is_admin": True,
				}
			).insert(ignore_permissions=True)
		except Exception as e:
			pass  # nosemgrep

	channel = [
		{
			"doctype": "Axon Channel",
			"name": "general",
			"type": "Open",
			"channel_name": "General",
			"workspace": default_workspace.name,
		}
	]

	make_records(channel)
