// Copyright (c) 2025, The Commit Company (Algocode Technologies Pvt. Ltd.) and contributors
// For license information, please see license.txt

frappe.ui.form.on("Axon Incoming Webhook", {
	refresh(frm) {
		const url = new URL(`/api/method/axon.webhook/${frm.doc.name}`, window.location.origin);
		frm.set_value("webhook_url", url.toString());
	},
});
