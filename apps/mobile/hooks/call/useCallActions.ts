import { useContext } from "react"
import { FrappeConfig, FrappeContext } from "frappe-react-sdk"
import { useAtom, useSetAtom } from "jotai"
import { toast } from "sonner-native"
import { activeCallAtom, callExpandedAtom, incomingCallAtom } from "@utils/callAtoms"

interface CallResponseData {
    call_id: string
    livekit_url: string
    livekit_room_name: string
    token: string
}

export const useCallActions = () => {
    const { call } = useContext(FrappeContext) as FrappeConfig

    const [activeCall, setActiveCall] = useAtom(activeCallAtom)
    const setCallExpanded = useSetAtom(callExpandedAtom)
    const setIncomingCall = useSetAtom(incomingCallAtom)

    const initiateCall = async (channelId: string) => {
        try {
            const res = await call.post("axon.api.calls.initiate_call", { channel_id: channelId }) as { message: CallResponseData }
            const data = res.message
            setActiveCall({
                call_id: data.call_id,
                channel_id: channelId,
                initiated_by: "",
                status: "Initiated",
                livekit_room_name: data.livekit_room_name,
                livekit_url: data.livekit_url,
                token: data.token,
            })
            setCallExpanded(true)
        } catch (e: any) {
            toast.error(e?.message ?? "Failed to start call")
        }
    }

    const joinCall = async (callId: string, channelId: string) => {
        try {
            const res = await call.post("axon.api.calls.join_call", { call_id: callId }) as { message: CallResponseData }
            const data = res.message
            setActiveCall({
                call_id: data.call_id,
                channel_id: channelId,
                initiated_by: "",
                status: "Connected",
                livekit_room_name: data.livekit_room_name,
                livekit_url: data.livekit_url,
                token: data.token,
            })
            setCallExpanded(true)
            setIncomingCall(null)
        } catch (e: any) {
            toast.error(e?.message ?? "Failed to join call")
        }
    }

    const endCall = async () => {
        if (!activeCall) return
        try {
            await call.post("axon.api.calls.end_call", { call_id: activeCall.call_id })
        } finally {
            setActiveCall(null)
        }
    }

    const dismissIncomingCall = () => setIncomingCall(null)

    return {
        activeCall,
        initiateCall,
        joinCall,
        endCall,
        dismissIncomingCall,
    }
}
