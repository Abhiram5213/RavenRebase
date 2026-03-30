import { Flex, IconButton, Tooltip } from "@radix-ui/themes"
import {
    useLocalParticipant,
    useLocalParticipantPermissions,
} from "@livekit/components-react"
import { Track } from "livekit-client"
import { useCallActions } from "@/hooks/call/useCallActions"
import { useSetAtom } from "jotai"
import { callUIModeAtom } from "@/utils/call/callAtoms"
import {
    BsMicFill, BsMicMuteFill,
    BsCameraVideoFill, BsCameraVideoOffFill,
    BsDisplayFill,
    BsTelephoneXFill,
    BsArrowsAngleContract,
    BsArrowsAngleExpand,
} from "react-icons/bs"
import { useAtomValue } from "jotai"
import { callUIModeAtom as callUIModeAtomRead } from "@/utils/call/callAtoms"

export const CallControls = () => {
    const { localParticipant, isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant()
    const { endCall } = useCallActions()
    const setUIMode = useSetAtom(callUIModeAtom)
    const uiMode = useAtomValue(callUIModeAtomRead)

    const toggleMic = () => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)
    const toggleCamera = () => localParticipant.setCameraEnabled(!isCameraEnabled)
    const toggleScreenShare = () => {
        const isSharing = localParticipant.isScreenShareEnabled
        localParticipant.setScreenShareEnabled(!isSharing)
    }
    const togglePip = () => setUIMode(uiMode === "pip" ? "split" : "pip")

    return (
        <Flex
            align="center"
            justify="center"
            gap="3"
            className="bg-gray-1 border-t border-gray-3 px-4 py-2"
        >
            <Tooltip content={isMicrophoneEnabled ? "Mute" : "Unmute"}>
                <IconButton
                    variant={isMicrophoneEnabled ? "solid" : "soft"}
                    color={isMicrophoneEnabled ? "gray" : "red"}
                    size="3"
                    onClick={toggleMic}
                >
                    {isMicrophoneEnabled ? <BsMicFill size={16} /> : <BsMicMuteFill size={16} />}
                </IconButton>
            </Tooltip>

            <Tooltip content={isCameraEnabled ? "Turn off camera" : "Turn on camera"}>
                <IconButton
                    variant={isCameraEnabled ? "solid" : "soft"}
                    color={isCameraEnabled ? "gray" : "red"}
                    size="3"
                    onClick={toggleCamera}
                >
                    {isCameraEnabled ? <BsCameraVideoFill size={16} /> : <BsCameraVideoOffFill size={16} />}
                </IconButton>
            </Tooltip>

            <Tooltip content="Share screen">
                <IconButton
                    variant={localParticipant.isScreenShareEnabled ? "solid" : "soft"}
                    color={localParticipant.isScreenShareEnabled ? "blue" : "gray"}
                    size="3"
                    onClick={toggleScreenShare}
                >
                    <BsDisplayFill size={16} />
                </IconButton>
            </Tooltip>

            <Tooltip content={uiMode === "pip" ? "Expand" : "Minimise"}>
                <IconButton variant="soft" color="gray" size="3" onClick={togglePip}>
                    {uiMode === "pip" ? <BsArrowsAngleExpand size={16} /> : <BsArrowsAngleContract size={16} />}
                </IconButton>
            </Tooltip>

            <Tooltip content="End call">
                <IconButton variant="solid" color="red" size="3" onClick={endCall}>
                    <BsTelephoneXFill size={16} />
                </IconButton>
            </Tooltip>
        </Flex>
    )
}
