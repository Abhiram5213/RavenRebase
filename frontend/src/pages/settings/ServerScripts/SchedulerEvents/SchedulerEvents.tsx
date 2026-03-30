import { ErrorBanner } from "@/components/layout/AlertBanner/ErrorBanner"
import { AxonSchedulerEvent } from "@/types/AxonIntegrations/AxonSchedulerEvent"
import { Button } from "@radix-ui/themes"
import { useFrappeDocTypeEventListener, useFrappeGetDocList } from "frappe-react-sdk"
import { Link } from "react-router-dom"
import { List } from "./ScheduledMessageList"
import PageContainer from "@/components/layout/Settings/PageContainer"
import SettingsContentContainer from "@/components/layout/Settings/SettingsContentContainer"
import SettingsPageHeader from "@/components/layout/Settings/SettingsPageHeader"
import { TableLoader } from "@/components/layout/Loaders/TableLoader"
import ServerScriptNotEnabledCallout from "@/components/feature/settings/scheduler-events/ServerScriptNotEnabledForm"
import { isSystemManager } from "@/utils/roles"
import { EmptyState, EmptyStateDescription, EmptyStateIcon, EmptyStateLinkAction, EmptyStateTitle } from "@/components/layout/EmptyState/EmptyListViewState"
import { LuCalendarClock } from "react-icons/lu"

const SchedulerEvents = () => {

    const isAxonAdmin = isSystemManager()

    const { data, error, isLoading, mutate } = useFrappeGetDocList<AxonSchedulerEvent>('Axon Scheduler Event', {
        fields: ['name', 'disabled', 'event_frequency', 'creation', 'owner'],
        orderBy: {
            field: 'modified',
            order: 'desc'
        }
    }, isAxonAdmin ? undefined : null, {
        errorRetryCount: 2
    })

    useFrappeDocTypeEventListener('Axon Scheduler Event', () => {
        mutate()
    })

    return (
        <PageContainer>
            <SettingsContentContainer>
                <SettingsPageHeader
                    title='Scheduled Messages'
                    description='You can create a scheduled message & a bot will send it to you at the specified time.'
                    actions={<Button asChild disabled={!isAxonAdmin}>
                        <Link to='create'>Create</Link>
                    </Button>}
                />
                {isLoading && !error && <TableLoader columns={2} />}
                <ErrorBanner error={error} />
                <ServerScriptNotEnabledCallout />
                {data && data.length > 0 && <List data={data} />}
                {(data?.length === 0 || !isAxonAdmin) && <EmptyState>
                    <EmptyStateIcon>
                        <LuCalendarClock />
                    </EmptyStateIcon>
                    <EmptyStateTitle>Reminders</EmptyStateTitle>
                    <EmptyStateDescription>
                        Schedule messages to be sent to you at a specific date and time.<br />These support the CRON syntax.
                    </EmptyStateDescription>
                    {isAxonAdmin && <EmptyStateLinkAction to='create'>
                        Schedule a reminder
                    </EmptyStateLinkAction>}
                </EmptyState>}
            </SettingsContentContainer>
        </PageContainer>
    )
}

export const Component = SchedulerEvents