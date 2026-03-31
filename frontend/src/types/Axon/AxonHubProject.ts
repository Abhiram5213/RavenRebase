export interface AxonHubProject {
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
    project_name: string
    status: 'Active' | 'Completed' | 'On Hold' | 'Cancelled'
    external_id?: string
    description?: string
}
