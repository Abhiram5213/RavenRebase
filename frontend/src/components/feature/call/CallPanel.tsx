import { LiveKitRoom } from "@livekit/components-react"
import "@livekit/components-styles"
import { useAtomValue } from "jotai"
import { activeCallAtom, callUIModeAtom } from "@/utils/call/callAtoms"
import { ParticipantGrid } from "./ParticipantGrid"
import { CallControls } from "./CallControls"
import { useCallActions } from "@/hooks/call/useCallActions"

export const CallPanel = () => {
    const activeCall = useAtomValue(activeCallAtom)
    const uiMode = useAtomValue(callUIModeAtom)
    const { endCall } = useCallActions()

    if (!activeCall || uiMode === "hidden") return null

    const isJitsi = activeCall?.provider === "jitsi"

    if (isJitsi) {
        // Jitsi Meet implementation using iframe
        const jitsiDomain = activeCall.jitsi_server_url?.replace(/^https?:\/\//, "") || "meet.jit.si"
        const roomName = activeCall.room_name || activeCall.livekit_room_name
        const jitsiUrl = `https://${jitsiDomain}/${roomName}?prejoinPageEnabled=false`

        return (
            <div className="h-full flex flex-col bg-gray-12">
                <div className="flex-1 min-h-0">
                    <iframe
                        src={jitsiUrl}
                        allow="camera; microphone; fullscreen; display-capture"
                        className="w-full h-full border-0"
                        style={{ minHeight: "100%" }}
                    />
                </div>
                <CallControls />
            </div>
        )
    }

    // LiveKit implementation (original)
    if (uiMode === "pip") {
        return (
            <LiveKitRoom
                serverUrl={activeCall.livekit_url}
                token={activeCall.token}
                connect={true}
                video={false}
                audio={true}
                onDisconnected={endCall}
                className="lk-room-container"
            >
                <div className="fixed bottom-6 right-6 z-50 w-72 h-48 rounded-xl overflow-hidden shadow-2xl border border-gray-4 bg-gray-12 flex flex-col">
                    <div className="flex-1 min-h-0">
                        <ParticipantGrid />
                    </div>
                    <CallControls />
                </div>
            </LiveKitRoom>
        )
    }

    // split mode — rendered inline inside CallLayout
    return (
        <LiveKitRoom
            serverUrl={activeCall.livekit_url}
            token={activeCall.token}
            connect={true}
            video={true}
            audio={true}
            onDisconnected={endCall}
            className="lk-room-container h-full flex flex-col"
        >
            <div className="flex-1 min-h-0 bg-gray-12">
                <ParticipantGrid />
            </div>
            <CallControls />
        </LiveKitRoom>
    )
}
