import { useAtomValue, useSetAtom } from "jotai"
import { activeCallAtom, callExpandedAtom } from "@utils/callAtoms"
import { useCallActions } from "@hooks/call/useCallActions"
import {
    AudioSession,
    LiveKitRoom,
    useParticipants,
    VideoTrack,
    useTracks,
    TrackReferenceOrPlaceholder,
} from "@livekit/react-native"
import { Track } from "livekit-client"
import { useEffect } from "react"
import {
    View,
    TouchableOpacity,
    Text,
    ScrollView,
    Pressable,
    Platform,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useColorScheme } from "@hooks/useColorScheme"
import Ionicons from "@expo/vector-icons/Ionicons"
import { useLocalParticipant } from "@livekit/react-native"

export const CallScreen = () => {
    const activeCall = useAtomValue(activeCallAtom)
    const setCallExpanded = useSetAtom(callExpandedAtom)
    const { endCall } = useCallActions()
    const { colors } = useColorScheme()

    useEffect(() => {
        // Start audio session when mounting the call
        AudioSession.startAudioSession()
        return () => {
            AudioSession.stopAudioSession()
        }
    }, [])

    if (!activeCall) return null

    return (
        <LiveKitRoom
            serverUrl={activeCall.livekit_url}
            token={activeCall.token}
            connect={true}
            audio={true}
            video={true}
            onDisconnected={endCall}
        >
            <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
                <CallRoomContent
                    onEndCall={endCall}
                    onMinimise={() => setCallExpanded(false)}
                />
            </SafeAreaView>
        </LiveKitRoom>
    )
}

const CallRoomContent = ({
    onEndCall,
    onMinimise,
}: {
    onEndCall: () => void
    onMinimise: () => void
}) => {
    const tracks = useTracks([
        { source: Track.Source.Camera, withPlaceholder: true },
        { source: Track.Source.ScreenShare, withPlaceholder: false },
    ])

    const { localParticipant, isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant()

    return (
        <View style={{ flex: 1 }}>
            {/* Video grid */}
            <View style={{ flex: 1 }}>
                <ParticipantGrid tracks={tracks} />
            </View>

            {/* Controls bar */}
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 16,
                    paddingVertical: 16,
                    paddingHorizontal: 24,
                    backgroundColor: "rgba(0,0,0,0.6)",
                }}
            >
                {/* Minimise */}
                <ControlButton
                    icon="chevron-down"
                    label="Min"
                    color="#fff"
                    bg="rgba(255,255,255,0.15)"
                    onPress={onMinimise}
                />

                {/* Mic toggle */}
                <ControlButton
                    icon={isMicrophoneEnabled ? "mic" : "mic-off"}
                    label={isMicrophoneEnabled ? "Mute" : "Unmute"}
                    color="#fff"
                    bg={isMicrophoneEnabled ? "rgba(255,255,255,0.15)" : "#ef4444"}
                    onPress={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
                />

                {/* Camera toggle */}
                <ControlButton
                    icon={isCameraEnabled ? "videocam" : "videocam-off"}
                    label={isCameraEnabled ? "Cam off" : "Cam on"}
                    color="#fff"
                    bg={isCameraEnabled ? "rgba(255,255,255,0.15)" : "#ef4444"}
                    onPress={() => localParticipant.setCameraEnabled(!isCameraEnabled)}
                />

                {/* End call */}
                <ControlButton
                    icon="call"
                    label="End"
                    color="#fff"
                    bg="#ef4444"
                    onPress={onEndCall}
                    rotate
                />
            </View>
        </View>
    )
}

const ParticipantGrid = ({ tracks }: { tracks: TrackReferenceOrPlaceholder[] }) => {
    const count = tracks.length
    if (count === 0) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ color: "#fff", opacity: 0.5 }}>Waiting for others…</Text>
            </View>
        )
    }

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View
                style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    flex: 1,
                }}
            >
                {tracks.map((track) => (
                    <View
                        key={`${track.participant.identity}-${track.source}`}
                        style={{
                            width: count === 1 ? "100%" : "50%",
                            aspectRatio: 16 / 9,
                            backgroundColor: "#111",
                        }}
                    >
                        <VideoTrack trackRef={track} style={{ flex: 1 }} />
                    </View>
                ))}
            </View>
        </ScrollView>
    )
}

const ControlButton = ({
    icon,
    label,
    color,
    bg,
    onPress,
    rotate = false,
}: {
    icon: any
    label: string
    color: string
    bg: string
    onPress: () => void
    rotate?: boolean
}) => (
    <TouchableOpacity
        onPress={onPress}
        style={{ alignItems: "center", gap: 4 }}
        activeOpacity={0.7}
    >
        <View
            style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: bg,
                justifyContent: "center",
                alignItems: "center",
                transform: rotate ? [{ rotate: "135deg" }] : [],
            }}
        >
            <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={{ color: "#fff", fontSize: 11, opacity: 0.8 }}>{label}</Text>
    </TouchableOpacity>
)
