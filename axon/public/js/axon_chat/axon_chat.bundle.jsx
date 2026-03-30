import * as React from "react";
import { App } from "./App";
import { createRoot } from "react-dom/client";


class AxonChat {
	constructor({ wrapper }) {
		this.$wrapper = $(wrapper);

		this.init();
	}

	init() {
		this.setup_app();
	}

	setup_app() {
		// create and mount the react app
		const root = createRoot(this.$wrapper.get(0));
		root.render(<App />);
		this.$axon_chat = root;
	}
}

frappe.provide("frappe.ui");
frappe.ui.AxonChat = AxonChat;
export default AxonChat;