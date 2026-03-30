import { useFrappePostCall } from "frappe-react-sdk"
import { useAtom, useSetAtom } from "jotai"
import { toast } from "sonner"
import { activeCallAtom, callUIModeAtom, incomingCallAtom } from "@/utils/call/callAtoms"

interface CallResponseData {
    call_id: string
    provider?: "livekit" | "jitsi"
    livekit_url?: string
    livekit_room_name?: string
    token?: string
    jitsi_server_url?: string
    room_name?: string
}


export const useCallActions = () => {
    const [activeCall, setActiveCall] = useAtom(activeCallAtom)
    const setCallUIMode = useSetAtom(callUIModeAtom)
    const setIncomingCall = useSetAtom(incomingCallAtom)

    const { call: initiateCallAPI, loading: initiating } = useFrappePostCall<CallResponseData>("axon.api.calls.initiate_call")
    const { call: joinCallAPI, loading: joining } = useFrappePostCall<CallResponseData>("axon.api.calls.join_call")
    const { call: endCallAPI } = useFrappePostCall("axon.api.calls.end_call")

    const initiateCall = async (channelId: string) => {
        try {
            const res = await initiateCallAPI({ channel_id: channelId })
            if (res) {
                const data = res
                setActiveCall({
                    call_id: data.call_id,
                    channel_id: channelId,
                    initiated_by: "",
                    status: "Initiated",
                    provider: data.provider,
                    livekit_room_name: data.livekit_room_name,
                    livekit_url: data.livekit_url,
                    token: data.token,
                    jitsi_server_url: data.jitsi_server_url,
                    room_name: data.room_name,
                })
                setCallUIMode("split")
            }
        } catch (e: any) {
            toast.error(e?.message ?? "Failed to start call")
        }
    }

    const joinCall = async (callId: string, channelId: string) => {
        try {
            const res = await joinCallAPI({ call_id: callId })
            if (res) {
                const data = res
                setActiveCall({
                    call_id: data.call_id,
                    channel_id: channelId,
                    initiated_by: "",
                    status: "Connected",
                    provider: data.provider,
                    livekit_room_name: data.livekit_room_name,
                    livekit_url: data.livekit_url,
                    token: data.token,
                    jitsi_server_url: data.jitsi_server_url,
                    room_name: data.room_name,
                })
                setCallUIMode("split")
                setIncomingCall(null)
            }
        } catch (e: any) {
            toast.error(e?.message ?? "Failed to join call")
        }
    }

    const endCall = async () => {
        if (!activeCall) return
        try {
            await endCallAPI({ call_id: activeCall.call_id })
        } finally {
            setActiveCall(null)
            setCallUIMode("hidden")
        }
    }

    const dismissIncomingCall = () => setIncomingCall(null)

    return {
        activeCall,
        initiateCall,
        joinCall,
        endCall,
        dismissIncomingCall,
        initiating,
        joining,
    }
}
