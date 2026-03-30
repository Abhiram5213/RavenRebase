# Copyright (c) 2024, The Commit Company and Contributors
# See license.txt

import frappe
from frappe.tests.utils import FrappeTestCase


class TestAxonMention(FrappeTestCase):
	def setUp(self):
		# Create a test workspace with a unique name
		suffix = frappe.generate_hash(length=8)
		workspace_name = "Test Workspace " + suffix
		self.workspace = frappe.get_doc({
			"doctype": "Axon Workspace",
			"workspace_name": workspace_name,
		}).insert(ignore_permissions=True)

		# Create a test user if it doesn't exist
		user_email = f"test_user_{suffix}@example.com"
		if not frappe.db.exists("User", user_email):
			user = frappe.get_doc({
				"doctype": "User",
				"email": user_email,
				"first_name": "Test Mention",
				"send_welcome_email": 0
			}).insert(ignore_permissions=True)
		
		# Create a test channel
		channel_name = "Test Channel " + suffix
		self.channel = frappe.get_doc({
			"doctype": "Axon Channel",
			"channel_name": channel_name,
			"workspace": self.workspace.name,
			"is_direct_message": 0
		}).insert(ignore_permissions=True)

	def test_mention_extraction(self):
		"""Test if mentions are correctly extracted from HTML content"""
		user_email = frappe.db.get_value("User", {"first_name": "Test Mention"}, "email")
		message_text = f'<p>Hello <span data-type="userMention" data-id="{user_email}">@Test Mention</span>, how are you?</p>'
		
		msg = frappe.get_doc({
			"doctype": "Axon Message",
			"channel_id": self.channel.name,
			"text": message_text,
			"message_type": "Text"
		}).insert(ignore_permissions=True)

		self.assertEqual(len(msg.mentions), 1)
		self.assertEqual(msg.mentions[0].user, user_email)

	def test_duplicate_mention_extraction(self):
		"""Test if duplicate mentions are handled correctly (should only add once)"""
		user_email = frappe.db.get_value("User", {"first_name": "Test Mention"}, "email")
		message_text = (
			f'<p>Hello <span data-type="userMention" data-id="{user_email}">@Test Mention</span>, '
			f'tagging you again <span data-type="userMention" data-id="{user_email}">@Test Mention</span></p>'
		)
		
		msg = frappe.get_doc({
			"doctype": "Axon Message",
			"channel_id": self.channel.name,
			"text": message_text,
			"message_type": "Text"
		}).insert(ignore_permissions=True)

		self.assertEqual(len(msg.mentions), 1)
		self.assertEqual(msg.mentions[0].user, user_email)
