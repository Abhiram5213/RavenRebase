import { useFrappeGetDocList } from 'frappe-react-sdk'
import { AxonHubApp } from '@/types/Axon/AxonHubApp'

const useFetchHubApps = () => {
    return useFrappeGetDocList<AxonHubApp>('Axon Hub App', {
        fields: ['name', 'app_name', 'url', 'icon', 'category', 'is_satellite'],
        filters: [['enabled', '=', 1]],
        orderBy: { field: 'app_name', order: 'asc' }
    }, {
        revalidateOnFocus: false,
    })
}

export default useFetchHubApps
