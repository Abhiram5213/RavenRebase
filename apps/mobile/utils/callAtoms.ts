import { atom } from "jotai"

export interface ActiveCall {
    call_id: string
    channel_id: string
    initiated_by: string
    status: "Initiated" | "Ringing" | "Connected" | "Ended"
    livekit_room_name: string
    livekit_url: string
    /** LiveKit JWT for the current user */
    token: string
}

export interface IncomingCall {
    call_id: string
    channel_id: string
    initiated_by: string
    livekit_room_name: string
}

/** The call this device is actively participating in */
export const activeCallAtom = atom<ActiveCall | null>(null)

/** Incoming call ringing for the user */
export const incomingCallAtom = atom<IncomingCall | null>(null)

/** Whether the call UI is expanded (true) or minimised pip (false) */
export const callExpandedAtom = atom<boolean>(true)
