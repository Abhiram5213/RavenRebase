import { Flex, Box } from '@radix-ui/themes'
import { Outlet, useParams } from 'react-router-dom'
import { lazy, Suspense, useContext, useEffect } from 'react'
import { Sidebar } from '../components/layout/Sidebar/Sidebar'
import { ChannelListProvider } from '../utils/channel/ChannelListProvider'
import { UserListProvider } from '@/utils/users/UserListProvider'
import { hasAxonUserRole } from '@/utils/roles'
import { FullPageLoader } from '@/components/layout/Loaders/FullPageLoader'
import CommandMenu from '@/components/feature/CommandMenu/CommandMenu'
import { useFetchActiveUsersRealtime } from '@/hooks/fetchers/useFetchActiveUsers'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { showNotification } from '@/utils/pushNotifications'
import MessageActionController from '@/components/feature/message-actions/MessageActionController'
import { useActiveSocketConnection } from '@/hooks/useActiveSocketConnection'
import { useFrappeEventListener, useSWRConfig } from 'frappe-react-sdk'
import { useUnreadThreadsCountEventListener } from '@/hooks/useUnreadThreadsCount'
import { UserContext } from '@/utils/auth/UserProvider'
import AIThreadAutoOpen from '@/components/feature/ai/AIThreadAutoOpen'
import { IncomingCallBanner } from '@/components/feature/call/IncomingCallBanner'
import { useSetAtom } from 'jotai'
import { activeCallAtom, callUIModeAtom, incomingCallAtom } from '@/utils/call/callAtoms'

const AddAxonUsersPage = lazy(() => import('@/pages/AddAxonUsersPage'))

export const MainPage = () => {

    const isAxonUser = hasAxonUserRole()

    if (isAxonUser) {
        return (
            <MainPageContent />
        )
    } else {
        // If the user does not have the Axon User role, then show an error message if the user cannot add more people.
        // Else, show the page to add people to Axon
        return <Suspense fallback={<FullPageLoader />}>
            <AddAxonUsersPage />
        </Suspense>
    }

}

const MainPageContent = () => {

    const { currentUser } = useContext(UserContext)

    const setIncomingCall = useSetAtom(incomingCallAtom)
    const setActiveCall = useSetAtom(activeCallAtom)
    const setCallUIMode = useSetAtom(callUIModeAtom)

    useFetchActiveUsersRealtime()

    useEffect(() => {
        //@ts-expect-error
        window?.frappePushNotification?.onMessage((payload) => {
            showNotification(payload)
        })
    }, [])

    const isMobile = useIsMobile()

    useActiveSocketConnection()
    

    // Listen to channel members updated events and invalidate the channel members cache
    const { mutate } = useSWRConfig()

    useFrappeEventListener('channel_members_updated', (payload) => {
        mutate(["channel_members", payload.channel_id])
    })

    // Call signalling listeners
    useFrappeEventListener('axon:call_initiated', (event) => {
        // If someone else initiated the call, show incoming banner
        if (event.initiated_by !== currentUser) {
            setIncomingCall({
                call_id: event.call_id,
                channel_id: event.channel_id,
                initiated_by: event.initiated_by,
                livekit_room_name: event.livekit_room_name,
            })
        }
    })

    useFrappeEventListener('axon:call_ended', (event) => {
        setIncomingCall(prev => prev?.call_id === event.call_id ? null : prev)
        setActiveCall(prev => {
            if (prev?.call_id === event.call_id) {
                setCallUIMode("hidden")
                return null
            }
            return prev
        })
    })

    const onThreadReplyEvent = useUnreadThreadsCountEventListener()

    const { threadID } = useParams()

    // Listen to realtime event for new message count
    useFrappeEventListener('thread_reply', (event) => {

        if (event.channel_id) {
            mutate(["thread_reply_count", event.channel_id], {
                message: event.number_of_replies
            }, {
                revalidate: false
            })

            // Dispatch a custom event that ThreadsList can listen to if it's mounted
            window.dispatchEvent(new CustomEvent('thread_updated', {
                detail: {
                    threadId: event.channel_id,
                    sentBy: event.sent_by,
                    lastMessageTimestamp: event.last_message_timestamp,
                    numberOfReplies: event.number_of_replies
                }
            }))
        }

        // Unread count only needs to be fetched for certain conditions

        // Ignore the event if the message is sent by the current user
        if (event.sent_by === currentUser) return

        // Ignore the event if the message is in the current open thread
        if (threadID === event.channel_id) return

        onThreadReplyEvent(event.channel_id)
    })

    return <UserListProvider>
        <ChannelListProvider>
            <Flex>
                {!isMobile &&
                    <Box className={`w-80 bg-gray-2 border-r-gray-3 border-r dark:bg-gray-1`} left="0" top='0' position="fixed">
                        <Sidebar />
                    </Box>
                }
                <Box className='md:ml-[var(--sidebar-width)] w-[calc(100vw-var(--sidebar-width)-0rem)] dark:bg-gray-2'>
                    <Outlet />
                </Box>
            </Flex>
            <CommandMenu />
            <MessageActionController />
            <AIThreadAutoOpen />
            <IncomingCallBanner />
        </ChannelListProvider>
    </UserListProvider>
}