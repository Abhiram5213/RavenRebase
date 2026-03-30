import { useAtomValue } from "jotai"
import { incomingCallAtom } from "@/utils/call/callAtoms"
import { useCallActions } from "@/hooks/call/useCallActions"
import { Button, Flex, Text } from "@radix-ui/themes"
import { useGetUser } from "@/hooks/useGetUser"
import { BsCameraVideo } from "react-icons/bs"

export const IncomingCallBanner = () => {
    const incoming = useAtomValue(incomingCallAtom)
    const { joinCall, dismissIncomingCall } = useCallActions()
    const caller = useGetUser(incoming?.initiated_by ?? "")

    if (!incoming) return null

    const callerName = caller?.full_name ?? incoming.initiated_by

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-1 border border-gray-4 rounded-xl shadow-lg px-4 py-3 min-w-72 animate-fadein">
            <Flex align="center" gap="3">
                <BsCameraVideo size={20} className="text-blue-9 shrink-0" />
                <Flex direction="column" gap="1" className="flex-1">
                    <Text size="2" weight="medium">{callerName} started a call</Text>
                </Flex>
                <Flex gap="2">
                    <Button
                        size="1"
                        color="green"
                        onClick={() => joinCall(incoming.call_id, incoming.channel_id)}
                    >
                        Join
                    </Button>
                    <Button size="1" color="red" variant="soft" onClick={dismissIncomingCall}>
                        Dismiss
                    </Button>
                </Flex>
            </Flex>
        </div>
    )
}
