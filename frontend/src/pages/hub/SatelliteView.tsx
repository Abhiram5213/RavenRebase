import { useParams } from 'react-router-dom'
import { Box, Flex, Text, Heading } from '@radix-ui/themes'
import { useFrappeGetDoc } from 'frappe-react-sdk'
import { AxonHubApp } from '@/types/Axon/AxonHubApp'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { TableLoader } from '@/components/layout/Loaders/TableLoader'
import { __ } from '@/utils/translations'

const SatelliteView = () => {
    const { appName } = useParams<{ appName: string }>()
    
    const { data: app, error, isLoading } = useFrappeGetDoc<AxonHubApp>(
        'Axon Hub App', 
        appName || '',
        {
            revalidateOnFocus: false
        }
    )

    if (isLoading) return <Box p="4"><TableLoader columns={1} /></Box>
    if (error) return <Box p="4"><ErrorBanner error={error} /></Box>
    if (!app) return <Box p="4"><Text>{__("App not found")}</Text></Box>

    return (
        <Flex direction="column" className="h-screen w-full overflow-hidden bg-white dark:bg-gray-1">
            <Flex justify="between" align="center" px="4" py="2" className="border-b border-gray-4 dark:border-gray-6 bg-gray-2">
                <Flex align="center" gap="3">
                    {app.icon && (
                        <Box className="w-6 h-6 rounded overflow-hidden">
                            <img src={app.icon} alt={app.app_name} className="w-full h-full object-cover" />
                        </Box>
                    )}
                    <Heading size="3" className="text-gray-12">{app.app_name}</Heading>
                </Flex>
                <Text size="1" className="text-gray-11">{app.url}</Text>
            </Flex>
            <Box className="flex-1 w-full">
                <iframe 
                    src={app.url} 
                    title={app.app_name}
                    className="w-full h-full border-none"
                    allow="camera; microphone; clipboard-read; clipboard-write; display-capture; fullscreen"
                />
            </Box>
        </Flex>
    )
}

export const Component = SatelliteView
