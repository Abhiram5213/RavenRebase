# Copyright (c) 2026, The Commit Company and contributors
# For license information, please see license.txt

from frappe.model.document import Document


class AxonCallParticipant(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		joined_at: DF.Datetime | None
		left_at: DF.Datetime | None
		user: DF.Link
	# end: auto-generated types

	pass
