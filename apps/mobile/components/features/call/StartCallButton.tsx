import { TouchableOpacity, View } from "react-native"
import { useAtomValue } from "jotai"
import { activeCallAtom } from "@utils/callAtoms"
import { useCallActions } from "@hooks/call/useCallActions"
import Ionicons from "@expo/vector-icons/Ionicons"
import { useColorScheme } from "@hooks/useColorScheme"

interface StartCallButtonProps {
    channelId: string
    /** If there's already an active call doc in this channel, pass its id to join */
    existingCallId?: string | null
}

export const StartCallButton = ({ channelId, existingCallId }: StartCallButtonProps) => {
    const { colors } = useColorScheme()
    const myActiveCall = useAtomValue(activeCallAtom)
    const { initiateCall, joinCall } = useCallActions()

    const iAmInACall = myActiveCall !== null
    const callAlreadyActive = !!existingCallId

    // Don't show the button if I'm already in a call in a *different* channel
    if (iAmInACall && myActiveCall?.channel_id !== channelId) return null

    const handlePress = () => {
        if (callAlreadyActive && existingCallId) {
            joinCall(existingCallId, channelId)
        } else {
            initiateCall(channelId)
        }
    }

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.7}
            style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: callAlreadyActive ? "#22c55e22" : "transparent",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Ionicons
                name="videocam-outline"
                size={22}
                color={callAlreadyActive ? "#22c55e" : colors.foreground}
            />
        </TouchableOpacity>
    )
}
