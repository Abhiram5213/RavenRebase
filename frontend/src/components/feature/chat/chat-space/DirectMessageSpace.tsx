import { DMChannelListItem } from "@/utils/channel/ChannelListProvider"
import { Box } from "@radix-ui/themes"
import { DMChannelHeader } from "../../chat-header/DMChannelHeader"
import { ChatBoxBody } from "../ChatStream/ChatBoxBody"
import { CallLayout } from "../../call/CallLayout"

interface DirectMessageSpaceProps {
    channelData: DMChannelListItem
}

export const DirectMessageSpace = ({ channelData }: DirectMessageSpaceProps) => {

    return (
        <CallLayout channelId={channelData.name}>
            <Box className="flex flex-col h-full">
                <DMChannelHeader channelData={channelData} />
                <ChatBoxBody channelData={channelData} />
            </Box>
        </CallLayout>
    )
}