import { AxonWorkspaceMember } from "@axon/types/Axon/AxonWorkspaceMember"
import { useFrappeGetCall } from "frappe-react-sdk"

type WorkspaceMemberFields = Pick<AxonWorkspaceMember, 'user' | 'is_admin' | 'creation' | 'name'>

export const useFetchWorkspaceMembers = (workspaceID: string) => {
    return useFrappeGetCall<{ message: WorkspaceMemberFields[] }>('axon.api.workspaces.fetch_workspace_members', { workspace: workspaceID }, ["workspace_members", workspaceID], {
        revalidateOnFocus: false,
        errorRetryCount: 2
    })
}