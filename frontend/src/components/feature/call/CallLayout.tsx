import { useAtomValue } from "jotai"
import { activeCallAtom, callUIModeAtom } from "@/utils/call/callAtoms"
import { CallPanel } from "./CallPanel"
import { type ReactNode } from "react"

interface CallLayoutProps {
    /** The chat content (header + stream + input) */
    children: ReactNode
    channelId: string
}

/**
 * Wraps the chat space. When a call is active in split mode, renders
 * the video panel side-by-side with chat. In pip/hidden modes, chat
 * takes full width and CallPanel renders as a floating overlay.
 */
export const CallLayout = ({ children, channelId }: CallLayoutProps) => {
    const activeCall = useAtomValue(activeCallAtom)
    const uiMode = useAtomValue(callUIModeAtom)

    const callBelongsHere = activeCall?.channel_id === channelId
    const showSplit = callBelongsHere && uiMode === "split"

    if (showSplit) {
        return (
            <div className="flex h-[calc(100vh-0px)] overflow-hidden">
                {/* Video panel — left half */}
                <div className="w-1/2 min-w-0 flex flex-col border-r border-gray-3">
                    <CallPanel />
                </div>
                {/* Chat panel — right half */}
                <div className="w-1/2 min-w-0 flex flex-col overflow-hidden">
                    {children}
                </div>
            </div>
        )
    }

    return (
        <>
            {children}
            {/* pip mode: floating overlay rendered from CallPanel itself */}
            {callBelongsHere && uiMode === "pip" && <CallPanel />}
        </>
    )
}
