import { useFrappeEventListener } from "frappe-react-sdk"
import { useSetAtom } from "jotai"
import { activeCallAtom, incomingCallAtom } from "@utils/callAtoms"

/**
 * Listens to call-related realtime events from the Axon backend.
 * Mount once at the root layout level.
 */
export const useCallEvents = (currentUser: string) => {
    const setIncomingCall = useSetAtom(incomingCallAtom)
    const setActiveCall = useSetAtom(activeCallAtom)

    useFrappeEventListener("axon:call_initiated", (event) => {
        // Show incoming banner only if someone else started the call
        if (event.initiated_by !== currentUser) {
            setIncomingCall({
                call_id: event.call_id,
                channel_id: event.channel_id,
                initiated_by: event.initiated_by,
                livekit_room_name: event.livekit_room_name,
            })
        }
    })

    useFrappeEventListener("axon:call_ended", (event) => {
        // Dismiss incoming ring if it matches
        setIncomingCall((prev) => (prev?.call_id === event.call_id ? null : prev))
        // Tear down active call if we're in it
        setActiveCall((prev) => {
            if (prev?.call_id === event.call_id) return null
            return prev
        })
    })
}
