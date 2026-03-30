import { useMemo } from 'react';
import useFetchActiveUsers from './useFetchActiveUsers';
import useCurrentAxonUser from '@axon/lib/hooks/useCurrentAxonUser';
import { useGetUser } from '@axon/lib/hooks/useGetUser';

export const useIsUserActive = (userID?: string): boolean => {

    const { myProfile: currentUserInfo } = useCurrentAxonUser()
    const { data } = useFetchActiveUsers()

    const user = useGetUser(userID)

    const isActive = useMemo(() => {
        // if user has explicitly set their status to invisible, do not show them as active
        if (user?.availability_status === 'Invisible') {
            return false
        } else if (userID === currentUserInfo?.name) {
            return true
        } else if (userID) {
            return data?.message.includes(userID) ?? false
        } else {
            return false
        }
    }, [userID, data])

    return isActive
}