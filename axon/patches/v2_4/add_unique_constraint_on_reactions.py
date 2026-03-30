import frappe

from axon.api.reactions import calculate_message_reaction
from axon.axon_messaging.doctype.axon_message_reaction.axon_message_reaction import (
	on_doctype_update,
)


def execute():
	"""
	Add a unique constraint on Axon Message Reaction on the message, owner and reaction_escaped fields
	"""

	# Before adding the constraint, we need to delete any existing reactions where the message, owner and reaction_escaped fields are the same

	# For this, we can count the number of reactions where the message, owner and reaction_escaped fields are the same
	duplicate_reactions = frappe.db.sql(
		"""
		SELECT
			message,
			owner,
			reaction_escaped,
			COUNT(*) AS count
		FROM
			`tabAxon Message Reaction`
		GROUP BY
			message,
			owner,
			reaction_escaped
		HAVING
			COUNT(*) > 1
		""",
		as_dict=True,
	)
	messages_to_be_updated = set()

	for reaction in duplicate_reactions:
		if reaction.count == 1:
			continue
		reaction_ids = frappe.db.get_all(
			"Axon Message Reaction",
			filters={
				"message": reaction.message,
				"owner": reaction.owner,
				"reaction_escaped": reaction.reaction_escaped,
			},
			fields=["name"],
		)
		# Delete all but the first one
		for reaction_id in reaction_ids[1:]:
			frappe.delete_doc("Axon Message Reaction", reaction_id.name, delete_permanently=True)

			# Update the count for the reaction
		messages_to_be_updated.add(reaction.message)

		# Update the count for the reactions
	for message in messages_to_be_updated:
		calculate_message_reaction(message_id=message, do_not_publish=True)

	# Add the unique constraint
	on_doctype_update()
