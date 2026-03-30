from . import __version__ as app_version

app_name = "axon"
app_title = "Axon"
app_publisher = "Your Organization"
app_description = "Messaging Application"
app_email = "support@yourcompany.com"
source_link = "https://github.com/your-org/axon"
app_logo = "/assets/axon/axon-logo.png"
app_logo_url = "/assets/axon/axon-logo.png"

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
app_include_css = "axon.bundle.css"
# app_include_css = "/assets/axon/css/axon.css"
# app_include_js = "/assets/axon/js/axon.js"                 ]
app_include_js = "axon.bundle.js"

add_to_apps_screen = [
	{
		"name": "axon",
		"logo": "/assets/axon/axon-logo.png",
		"title": "Axon",
		"route": "/axon",
		"has_permission": "axon.permissions.check_app_permission",
	}
]


sounds = [
	{
		"name": "axon_notification",
		"src": "/assets/axon/sounds/axon_notification.mp3",
		"volume": 0.2,
	},
]

extend_bootinfo = "axon.boot.boot_session"
# include js, css files in header of web template
# web_include_css = "/assets/axon/css/axon.css"
# web_include_js = "/assets/axon/js/axon.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "axon/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# "Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# "methods": "axon.utils.jinja_methods",
# "filters": "axon.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "axon.install.before_install"
after_install = "axon.install.after_install"
# after_sync = ""

# Uninstallation
# ------------

# before_uninstall = "axon.uninstall.before_uninstall"
after_uninstall = "axon.uninstall.after_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "axon.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# "Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# "Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# "ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

doc_events = {
	"*": {
		"after_insert": "axon.axon_integrations.doctype.axon_document_notification.axon_document_notification.run_document_notification",
		"on_update": "axon.axon_integrations.doctype.axon_document_notification.axon_document_notification.run_document_notification",
		"on_trash": "axon.axon_integrations.doctype.axon_document_notification.axon_document_notification.run_document_notification",
		"on_cancel": "axon.axon_integrations.doctype.axon_document_notification.axon_document_notification.run_document_notification",
		"on_submit": "axon.axon_integrations.doctype.axon_document_notification.axon_document_notification.run_document_notification",
	},
	"User": {
		"after_insert": "axon.axon.doctype.axon_user.axon_user.add_user_to_axon",
		"on_update": "axon.axon.doctype.axon_user.axon_user.add_user_to_axon",
		"on_trash": "axon.axon.doctype.axon_user.axon_user.remove_user_from_axon",
	},
	"Department": {
		"after_insert": "axon.axon_integrations.controllers.department.after_insert",
		"on_update": "axon.axon_integrations.controllers.department.on_update",
		"on_trash": "axon.axon_integrations.controllers.department.on_trash",
	},
	"Employee": {
		"after_insert": "axon.axon_integrations.controllers.employee.after_insert",
		"on_update": "axon.axon_integrations.controllers.employee.on_update",
		"on_trash": "axon.axon_integrations.controllers.employee.on_trash",
	},
}

# Scheduled Tasks
# ---------------

scheduler_events = {
	# "all": [
	# 	"axon.scheduler.all"
	# ],
	# "daily": [
	# 	"axon.scheduler.daily"
	# ],
	# "hourly": [
	# 	"axon.scheduler.hourly"
	# ],
	# "weekly": [
	# 	"axon.scheduler.weekly"
	# ],
	# "monthly": [
	# 	"axon.scheduler.monthly"
	# ],
	"daily_maintenance": [
		"axon.scheduler.daily.sync_invalid_tokens",
		"axon.axon_cloud_notifications.sync_users_tokens_to_axon_cloud",
	],
	"cron": {
		# run every 5 minutes
		"*/5 * * * *": ["axon.scheduler.close_expired_polls.close_expired_polls"]
	},
}

# Testing
# -------

# before_tests = "axon.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# "frappe.desk.doctype.event.event.get_events": "axon.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# "Task": "axon.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

ignore_links_on_delete = ["Axon Message", "Axon Call"]


# User Data Protection
# --------------------

# user_data_fields = [
# {
# "doctype": "{doctype_1}",
# "filter_by": "{filter_by}",
# "redact_fields": ["{field_1}", "{field_2}"],
# "partial": 1,
# },
# {
# "doctype": "{doctype_2}",
# "filter_by": "{filter_by}",
# "partial": 1,
# },
# {
# "doctype": "{doctype_3}",
# "strict": False,
# },
# {
# "doctype": "{doctype_4}"
# }
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# "axon.auth.validate"
# ]

additional_timeline_content = {"*": ["axon.api.axon_message.get_timeline_message_content"]}

website_route_rules = [
	{"from_route": "/axon/<path:app_path>", "to_route": "axon"},
	{"from_route": "/axon_mobile/<path:app_path>", "to_route": "axon"},
]

permission_query_conditions = {
	"Axon Channel": "axon.permissions.axon_channel_query",
	"Axon Message": "axon.permissions.axon_message_query",
	"Axon Poll": "axon.permissions.axon_poll_query",
	"Axon Poll Vote": "axon.permissions.axon_poll_vote_query",
	"Axon Workspace": "axon.permissions.axon_workspace_query",
	"Axon Workspace Member": "axon.permissions.axon_workspace_member_query",
	"Axon Channel Member": "axon.permissions.axon_channel_member_query",
}

has_permission = {
	"Axon Channel": "axon.permissions.channel_has_permission",
	"Axon Channel Member": "axon.permissions.channel_member_has_permission",
	"Axon Message": "axon.permissions.message_has_permission",
	"Axon Poll Vote": "axon.permissions.axon_poll_vote_has_permission",
	"Axon Poll": "axon.permissions.axon_poll_has_permission",
	"Axon User": "axon.permissions.axon_user_has_permission",
	"Axon Workspace Member": "axon.permissions.workspace_member_has_permission",
	"Axon Workspace": "axon.permissions.workspace_has_permission",
}

on_session_creation = "axon.api.user_availability.set_user_active"
on_logout = "axon.api.user_availability.set_user_inactive"

export_python_type_annotations = True
require_type_annotated_api_methods = True

axon_document_link_override = "axon.api.document_link.get_new_app_document_links"

# Translation
# ------------
# List of apps whose translatable strings should be excluded from this app's translations.
ignore_translatable_strings_from = ["frappe"]
