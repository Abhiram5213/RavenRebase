export type SiteInformation = {
    url: string,
    /** OAuth client ID for Axon Mobile */
    client_id: string,
    /** Site name used for SocketIO connection */
    sitename: string,
    /** Logo of the site as set in Navbar Settings. If not set, the path to the Axon logo is used */
    logo: string,
    /** App name as set in Website Settings or System Settings - defaults to "Axon" */
    app_name: string,
    /** Version of Axon installed on the site */
    axon_version: string,
    /** Version of Frappe installed on the site */
    frappe_version: string,
    /** System timezone as set in System Settings */
    system_timezone: string,
}
