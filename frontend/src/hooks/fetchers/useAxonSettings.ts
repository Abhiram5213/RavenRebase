import { AxonSettings } from "@/types/Axon/AxonSettings"
import { useFrappeGetDoc } from "frappe-react-sdk"

const useAxonSettings = () => {

    const { data, mutate, error } = useFrappeGetDoc<AxonSettings>("Axon Settings", "Axon Settings", "axon_settings", {
        revalidateOnFocus: false,
        // Refresh every 8 hours or on page refresh
        dedupingInterval: 8 * 60 * 60 * 1000
    })

    return {
        axonSettings: data,
        mutate,
        error
    }
}

export default useAxonSettings