import frappe
from frappe import _

@frappe.whitelist()
def ingest_knowledge(title, entry_type, source_app, hub_project=None, content_raw=None, deep_link=None, metadata=None):
    """
    Unified endpoint for satellite apps to push data into the Axon Hub Knowledge Lake.
    """
    if not frappe.db.exists("Axon Hub App", source_app):
        frappe.throw(_("Source App {0} does not exist").format(source_app))
    
    if hub_project and not frappe.db.exists("Axon Hub Project", hub_project):
        frappe.throw(_("Hub Project {0} does not exist").format(hub_project))

    doc = frappe.get_doc({
        "doctype": "Axon Hub Knowledge Entry",
        "title": title,
        "entry_type": entry_type,
        "source_app": source_app,
        "hub_project": hub_project,
        "content_raw": content_raw,
        "deep_link": deep_link,
        "metadata": metadata
    })
    
    doc.insert(ignore_permissions=True)
    frappe.db.commit()
    
    return doc.name

@frappe.whitelist()
def get_projects():
    """Returns a list of active Hub Projects."""
    return frappe.get_all("Axon Hub Project", filters={"status": "Active"}, fields=["name", "project_name"])

@frappe.whitelist()
def set_channel_project(channel_id, hub_project):
    """Links a channel to a specific hub project."""
    if not frappe.db.exists("Axon Channel", channel_id):
        frappe.throw(_("Channel {0} does not exist").format(channel_id))
    
    if hub_project and not frappe.db.exists("Axon Hub Project", hub_project):
        frappe.throw(_("Hub Project {0} does not exist").format(hub_project))
        
    frappe.db.set_value("Axon Channel", channel_id, "hub_project", hub_project)
    return True
