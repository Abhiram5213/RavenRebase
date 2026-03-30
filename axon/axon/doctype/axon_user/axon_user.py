# Copyright (c) 2023, The Commit Company and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document


class AxonUser(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		from axon.axon.doctype.axon_pinned_channels.axon_pinned_channels import AxonPinnedChannels

		availability_status: DF.Literal["", "Available", "Away", "Do not disturb", "Invisible"]
		bot: DF.Link | None
		chat_style: DF.Literal["Simple", "Left-Right"]
		custom_status: DF.Data | None
		enabled: DF.Check
		first_name: DF.Data | None
		full_name: DF.Data
		last_mention_viewed_on: DF.Datetime | None
		pinned_channels: DF.Table[AxonPinnedChannels]
		type: DF.Literal["User", "Bot"]
		user: DF.Link | None
		user_image: DF.AttachImage | None
	# end: auto-generated types

	def autoname(self):
		if self.type == "Bot":
			self.name = self.bot
		else:
			self.name = self.user

	def before_validate(self):
		if self.user:
			self.type = "User"
		if not self.full_name:
			self.full_name = self.first_name

	def validate(self):
		if self.type == "Bot" and not self.bot:
			frappe.throw(_("Bot is mandatory"))

		if self.type == "User" and not self.user:
			frappe.throw(_("User is mandatory"))

	def before_insert(self):
		if self.type != "Bot":
			self.update_photo_from_user()

	def after_insert(self):
		self.invalidate_user_list_cache()

	def on_update(self):
		self.invalidate_user_list_cache()

	def on_trash(self):
		"""
		Remove the Axon User from all channels
		"""
		frappe.db.delete("Axon Channel Member", {"user_id": self.user})

	def after_delete(self):
		"""
		Remove the Axon User role from the user.
		"""
		if self.user:
			user = frappe.get_doc("User", self.user)
			user.flags.ignore_permissions = True
			user.flags.deleting_axon_user = True
			user.remove_roles("Axon User")
			user.save()

		self.invalidate_user_list_cache()

	def invalidate_user_list_cache(self):

		from axon.api.axon_users import get_users

		get_users.clear_cache()

	def update_photo_from_user(self):
		"""
		We need to create a new File record for the user image and attach it to the Axon User record.
		Why not just copy the URL from the User record? Because the URL is not accessible to the Axon User,
		and Frappe creates a duplicate file in the system (that is public) but does not update the URL in the field.
		"""
		user_image = frappe.db.get_value("User", self.user, "user_image")
		if user_image and not self.user_image:
			image_file = frappe.get_doc(
				{
					"doctype": "File",
					"file_url": user_image,
					"attached_to_doctype": "Axon User",
					"attached_to_name": self.user,
					"attached_to_field": "user_image",
					"is_private": 1,
				}
			).insert(ignore_permissions=True)
			self.user_image = image_file.file_url


def add_user_to_axon(doc, method):
	# called when the user is inserted or updated
	# If the auto-create setting is set to True, check if the user is a System user. If yes, then create a Axon User record for the user.
	# Else, check if the user has a Axon User role. If yes, then create a Axon User record for the user if not already created.

	# If the user is already added to Axon, do nothing.
	if not doc.flags.deleting_axon_user:
		if frappe.db.exists("Axon User", {"user": doc.name}):
			# Check if the role is still present. If not, then inactivate the Axon User record.
			has_axon_role = False
			for role in doc.get("roles"):
				if role.role == "Axon User":
					has_axon_role = True
					break

			if has_axon_role:
				axon_user = frappe.get_doc("Axon User", {"user": doc.name})
				axon_user.full_name = doc.full_name or doc.first_name
				axon_user.first_name = doc.first_name
				axon_user.enabled = doc.enabled
				axon_user.save(ignore_permissions=True)
			else:
				axon_user = frappe.get_doc("Axon User", {"user": doc.name})
				axon_user.full_name = doc.full_name or doc.first_name
				axon_user.first_name = doc.first_name
				axon_user.enabled = 0
				axon_user.save(ignore_permissions=True)
		else:
			# Axon user does not exist.
			# Only create axon user if it exists in the system.
			if frappe.db.exists("User", doc.name):
				# Check if the user is a system user.
				auto_add = False
				if doc.user_type == "System User":
					auto_add = frappe.db.get_single_value("Axon Settings", "auto_add_system_users")

				if auto_add or "Axon User" in [d.role for d in doc.get("roles")]:
					doc.append("roles", {"role": "Axon User"})
					# Create a Axon User record for the user.
					axon_user = frappe.new_doc("Axon User")
					axon_user.user = doc.name
					axon_user.full_name = doc.full_name or doc.first_name
					axon_user.first_name = doc.first_name
					axon_user.enabled = doc.enabled
					axon_user.insert(ignore_permissions=True)


def remove_user_from_axon(doc, method):
	# called when the user is deleted
	# If the user is deleted, then delete the Axon User record for the user.
	if frappe.db.exists("Axon User", {"user": doc.name}):
		axon_user = frappe.get_doc("Axon User", {"user": doc.name})
		axon_user.delete(ignore_permissions=True)
