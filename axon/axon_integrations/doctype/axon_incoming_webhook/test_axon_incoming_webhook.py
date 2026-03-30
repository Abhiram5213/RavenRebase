# Copyright (c) 2025, The Commit Company (Algocode Technologies Pvt. Ltd.) and Contributors
# For license information, please see license.txt

# import frappe
from frappe.tests import IntegrationTestCase, UnitTestCase

# On IntegrationTestCase, the doctype test records and all
# link-field test record dependencies are recursively loaded
# Use these module variables to add/remove to/from that list
EXTRA_TEST_RECORD_DEPENDENCIES = []  # eg. ["User"]
IGNORE_TEST_RECORD_DEPENDENCIES = []  # eg. ["User"]


class UnitTestAxonIncomingWebhook(UnitTestCase):
	"""
	Unit tests for AxonIncomingWebhook.
	Use this class for testing individual functions and methods.
	"""

	pass


class IntegrationTestAxonIncomingWebhook(IntegrationTestCase):
	"""
	Integration tests for AxonIncomingWebhook.
	Use this class for testing interactions between multiple components.
	"""

	pass
