import frappe
from frappe import _
from openai import OpenAI


def get_open_ai_client():
	"""
	Get the OpenAI client
	"""

	axon_settings = frappe.get_cached_doc("Axon Settings")

	if not axon_settings.enable_ai_integration:
		frappe.throw(_("AI Integration is not enabled"))

	openai_api_key = axon_settings.get_password("openai_api_key")
	openai_organisation_id = (axon_settings.openai_organisation_id or "").strip()
	openai_project_id = (axon_settings.openai_project_id or "").strip()

	client_args = {"api_key": openai_api_key.strip(), "organization": openai_organisation_id}
	if openai_project_id:
		client_args["project"] = openai_project_id

	return OpenAI(**client_args)


def get_openai_models():
	"""
	Get the available OpenAI models
	"""
	client = get_open_ai_client()
	return client.models.list()


code_interpreter_file_types = [
	"pdf",
	"csv",
	"docx",
	"doc",
	"xlsx",
	"pptx",
	"txt",
	"png",
	"jpg",
	"jpeg",
	"md",
	"json",
	"html",
]

file_search_file_types = ["pdf", "doc", "docx", "json", "txt", "md", "html", "pptx"]
