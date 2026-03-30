# Copyright (c) 2026, The Commit Company and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class AxonCall(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		from axon.axon.doctype.axon_call_participant.axon_call_participant import AxonCallParticipant

		channel_id: DF.Link
		end_time: DF.Datetime | None
		initiated_by: DF.Link
		livekit_room_name: DF.Data | None
		participants: DF.Table[AxonCallParticipant]
		start_time: DF.Datetime | None
		status: DF.Literal["Initiated", "Ringing", "Connected", "Ended"]
	# end: auto-generated types

	def after_insert(self):
		self._publish_to_channel("axon:call_initiated")
		self._notify_members()

	def on_update(self):
		if self.status == "Ended":
			self._publish_to_channel("axon:call_ended")

	def _publish_to_channel(self, event: str):
		frappe.publish_realtime(
			event=event,
			message=self._call_payload(),
			room=f"open_doc:Axon Channel/{self.channel_id}",
			after_commit=not frappe.flags.in_test,
		)

	def _notify_members(self):
		"""Send per-user notification so mobile can ring incoming call."""
		members = frappe.get_all(
			"Axon Channel Member",
			filters={"channel_id": self.channel_id},
			pluck="user_id",
		)
		for user in members:
			if user == self.initiated_by:
				continue
			frappe.publish_realtime(
				event="axon:call_incoming",
				message=self._call_payload(),
				user=user,
				after_commit=not frappe.flags.in_test,
			)

	def _call_payload(self) -> dict:
		return {
			"call_id": self.name,
			"channel_id": self.channel_id,
			"initiated_by": self.initiated_by,
			"status": self.status,
			"livekit_room_name": self.livekit_room_name,
			"start_time": str(self.start_time) if self.start_time else None,
		}
