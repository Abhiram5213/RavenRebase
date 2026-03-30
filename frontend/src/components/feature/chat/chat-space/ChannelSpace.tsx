import { Box } from '@radix-ui/themes'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { ChatBoxBody } from '../ChatStream/ChatBoxBody'
import { ChannelHeader } from '../../chat-header/ChannelHeader'
import { CallLayout } from '../../call/CallLayout'

interface ChannelSpaceProps {
    channelData: ChannelListItem
}

export const ChannelSpace = ({ channelData }: ChannelSpaceProps) => {

    return (
        <CallLayout channelId={channelData.name}>
            <Box className="flex flex-col h-full">
                <ChannelHeader channelData={channelData} />
                <ChatBoxBody channelData={channelData} />
            </Box>
        </CallLayout>
    )
}