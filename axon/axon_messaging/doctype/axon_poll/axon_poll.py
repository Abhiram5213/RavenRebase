# Copyright (c) 2024, The Commit Company and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import get_datetime, now_datetime


class AxonPoll(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		from axon.axon_messaging.doctype.axon_poll_option.axon_poll_option import AxonPollOption

		end_date: DF.Datetime | None
		is_anonymous: DF.Check
		is_disabled: DF.Check
		is_multi_choice: DF.Check
		options: DF.Table[AxonPollOption]
		question: DF.SmallText
		total_votes: DF.Int
	# end: auto-generated types

	def before_validate(self):
		# Total_votes is the sum of all votes in the poll per user
		poll_votes = frappe.get_all(
			"Axon Poll Vote", filters={"poll_id": self.name}, fields=["user_id"], group_by="user_id"
		)

		# count the number of unique users who voted
		self.total_votes = len(poll_votes) if poll_votes else 0

		# Check if poll has expired and should be disabled
		if self.end_date and not self.is_disabled:
			end_datetime = get_datetime(self.end_date)
			if now_datetime() >= end_datetime:
				self.is_disabled = 1

	def on_trash(self):
		# Delete all poll votes
		frappe.db.delete("Axon Poll Vote", {"poll_id": self.name})
