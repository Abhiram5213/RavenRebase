import { IconButton, Tooltip } from "@radix-ui/themes"
import { useCallActions } from "@/hooks/call/useCallActions"
import { useActiveCallInChannel } from "@/hooks/call/useActiveCallInChannel"
import { useAtomValue } from "jotai"
import { activeCallAtom } from "@/utils/call/callAtoms"
import { BsCameraVideo, BsCameraVideoOff } from "react-icons/bs"

interface StartCallButtonProps {
    channelId: string
}

export const StartCallButton = ({ channelId }: StartCallButtonProps) => {
    const { activeCall: existingCall } = useActiveCallInChannel(channelId)
    const myActiveCall = useAtomValue(activeCallAtom)
    const { initiateCall, joinCall, initiating, joining } = useCallActions()

    const iAmInACall = myActiveCall !== null
    const callAlreadyActive = existingCall !== null

    const handleClick = () => {
        if (callAlreadyActive && existingCall) {
            joinCall(existingCall.name, channelId)
        } else {
            initiateCall(channelId)
        }
    }

    const tooltipText = iAmInACall
        ? "You are already in a call"
        : callAlreadyActive
            ? "Join ongoing call"
            : "Start video call"

    return (
        <Tooltip content={tooltipText}>
            <IconButton
                variant="ghost"
                color={callAlreadyActive ? "green" : "gray"}
                size="2"
                disabled={iAmInACall && !callAlreadyActive}
                loading={initiating || joining}
                onClick={handleClick}
                aria-label={tooltipText}
            >
                {callAlreadyActive
                    ? <BsCameraVideo size={18} className="text-green-10" />
                    : <BsCameraVideo size={18} />
                }
            </IconButton>
        </Tooltip>
    )
}
