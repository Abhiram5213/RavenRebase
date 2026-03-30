import { useFetchChannelMembers } from '@axon/lib/hooks/useFetchChannelMembers';
import { useMemo } from 'react';
import useCurrentAxonUser from '@axon/lib/hooks/useCurrentAxonUser';
import ActionsDropdownMenu from './ActionsDropdownMenu';

const ThreadActions = ({ threadID }: { threadID: string }) => {

    const { channelMembers } = useFetchChannelMembers(threadID)
    const { myProfile: user } = useCurrentAxonUser()

    const channelMember = useMemo(() => {
        if (user && channelMembers) {
            return channelMembers[user.name]
        }
        return null
    }, [user, channelMembers])

    if (!channelMember) return null

    return (
        <ActionsDropdownMenu threadID={threadID} channelMember={channelMember} />
    )
}

export default ThreadActions