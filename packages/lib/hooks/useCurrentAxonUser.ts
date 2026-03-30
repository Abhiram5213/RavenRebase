import { AxonUser } from '@axon/types/Axon/AxonUser'
import { useFrappeGetCall } from 'frappe-react-sdk'

const useCurrentAxonUser = () => {

    const { data, mutate } = useFrappeGetCall<{ message: AxonUser }>('axon.api.axon_users.get_current_axon_user',
        undefined,
        'my_profile',
        {
            revalidateIfStale: false,
            revalidateOnFocus: true,
            shouldRetryOnError: false,
            revalidateOnReconnect: true
        }
    )

    return {
        myProfile: data?.message,
        mutate
    }

}

export default useCurrentAxonUser