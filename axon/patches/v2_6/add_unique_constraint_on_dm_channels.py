from axon.axon_channel_management.doctype.axon_channel.axon_channel import on_doctype_update


def execute():
	"""
	This patch adds the unique constraint to the Axon Channel table
	"""
	on_doctype_update()
