import { SWRConfiguration, useFrappeGetCall } from 'frappe-react-sdk'
import { AxonWorkspace } from '@axon/types/Axon/AxonWorkspace'

export type WorkspaceFields = Pick<AxonWorkspace, 'name' | 'workspace_name' | 'logo' | 'type' | 'can_only_join_via_invite' | 'description'> & {
    workspace_member_name?: string
    is_admin?: 0 | 1
}

const useFetchWorkspaces = (swrConfig?: SWRConfiguration) => {
    return useFrappeGetCall<{ message: WorkspaceFields[] }>('axon.api.workspaces.get_list', undefined, 'workspaces_list', {
        revalidateOnFocus: false,
        revalidateIfStale: false,
        ...(swrConfig || {})
    })
}

export default useFetchWorkspaces