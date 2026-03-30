import { atom } from "jotai"

export interface ActiveCall {
    call_id: string
    channel_id: string
    initiated_by: string
    status: "Initiated" | "Ringing" | "Connected" | "Ended"
    provider?: "livekit" | "jitsi"
    livekit_room_name?: string
    livekit_url?: string
    /** LiveKit JWT for the current user */
    token?: string
    /** Jitsi specific fields */
    jitsi_server_url?: string
    room_name?: string
}

export interface IncomingCall {
    call_id: string
    channel_id: string
    initiated_by: string
    livekit_room_name?: string
    provider?: "livekit" | "jitsi"
}

/** The call the current user is actively participating in */
export const activeCallAtom = atom<ActiveCall | null>(null)

/** An incoming call ringing for the user (from another channel) */
export const incomingCallAtom = atom<IncomingCall | null>(null)

/** UI display mode for the active call panel */
export type CallUIMode = "split" | "pip" | "hidden"
export const callUIModeAtom = atom<CallUIMode>("hidden")
