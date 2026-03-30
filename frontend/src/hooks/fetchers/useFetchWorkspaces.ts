import { useFrappeGetCall } from 'frappe-react-sdk'
import { AxonWorkspace } from '@/types/Axon/AxonWorkspace'

export type WorkspaceFields = Pick<AxonWorkspace, 'name' | 'workspace_name' | 'logo' | 'type' | 'can_only_join_via_invite' | 'description'> & {
    workspace_member_name?: string
    is_admin?: 0 | 1
}

const useFetchWorkspaces = () => {
    return useFrappeGetCall<{ message: WorkspaceFields[] }>('axon.api.workspaces.get_list', undefined, 'workspaces_list', {
        revalidateOnFocus: false,
        keepPreviousData: true
    })
}

export default useFetchWorkspaces