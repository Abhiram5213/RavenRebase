import { useFrappeGetCall } from "frappe-react-sdk"

interface ActiveCallData {
    name: string
    initiated_by: string
    status: string
    livekit_room_name: string
    start_time: string
}

export const useActiveCallInChannel = (channelId: string) => {
    const { data, isLoading, mutate } = useFrappeGetCall<{ message: ActiveCallData | null }>(
        "axon.api.calls.get_active_call",
        { channel_id: channelId },
        channelId ? `active_call_${channelId}` : null,
        { revalidateOnFocus: false }
    )

    return {
        activeCall: data?.message ?? null,
        isLoading,
        mutate,
    }
}
