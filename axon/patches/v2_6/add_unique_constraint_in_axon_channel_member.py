import frappe

from axon.axon_channel_management.doctype.axon_channel_member.axon_channel_member import (
	on_doctype_update,
)


def execute():
	"""
	This patch adds the unique constraint to the Axon Channel Member table
	"""
	on_doctype_update()
