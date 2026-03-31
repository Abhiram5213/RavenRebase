export interface AxonHubApp {
    name: string
    creation: string
    modified: string
    modified_by: string
    owner: string
    docstatus: 0 | 1 | 2
    parent?: string
    parentfield?: string
    parenttype?: string
    idx?: number
    app_name: string
    category: 'Communication' | 'Management' | 'Knowledge' | 'Development' | 'Finance' | 'Other'
    is_satellite: 0 | 1
    enabled: 0 | 1
    url: string
    icon?: string
}
