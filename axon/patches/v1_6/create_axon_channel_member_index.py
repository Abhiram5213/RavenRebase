from axon.axon_channel_management.doctype.axon_channel_member.axon_channel_member import (
	on_doctype_update,
)


def execute():
	# Indexing all Axon Channel Members
	on_doctype_update()
