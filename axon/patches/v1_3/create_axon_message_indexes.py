from axon.axon_messaging.doctype.axon_message.axon_message import on_doctype_update


def execute():
	# Indexing all Axon Messages
	on_doctype_update()
