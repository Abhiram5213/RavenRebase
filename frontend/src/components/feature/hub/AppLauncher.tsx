import { Box, Flex, Grid, IconButton, Popover, Text, Tooltip } from '@radix-ui/themes'
import { BiGridAlt } from 'react-icons/bi'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/layout/Drawer'
import useFetchHubApps from '@/hooks/fetchers/useFetchHubApps'
import { __ } from '@/utils/translations'
import { Link } from 'react-router-dom'

const AppLauncher = () => {
    const { data: apps, isLoading } = useFetchHubApps()
    const isDesktop = useIsDesktop()

    if (isLoading || !apps) return null

    const LauncherContent = () => (
        <Box p="3" className="w-64 sm:w-80">
            <Text size="2" weight="bold" mb="3" as="div" className="text-gray-11 uppercase tracking-wider">
                {__("App Launcher")}
            </Text>
            <Grid columns="3" gap="3">
                {apps.map((app) => (
                    <Tooltip key={app.name} content={app.app_name}>
                        <Link 
                            to={app.is_satellite ? `/hub/${app.name}` : app.url} 
                            target={app.is_satellite ? undefined : "_blank"}
                            className="flex flex-col items-center gap-2 p-2 hover:bg-gray-3 rounded-md transition-colors group text-center"
                        >
                            <Box className="w-12 h-12 rounded-lg bg-gray-4 flex items-center justify-center overflow-hidden group-hover:bg-gray-5 transition-colors">
                                {app.icon ? (
                                    <img src={app.icon} alt={app.app_name} className="w-full h-full object-cover" />
                                ) : (
                                    <BiGridAlt className="text-2xl text-gray-10" />
                                )}
                            </Box>
                            <Text size="1" weight="medium" className="truncate w-full text-gray-12">
                                {app.app_name}
                            </Text>
                        </Link>
                    </Tooltip>
                ))}
            </Grid>
        </Box>
    )

    if (isDesktop) {
        return (
            <Popover.Root>
                <Popover.Trigger>
                    <IconButton variant="ghost" color="gray" className="text-gray-11 hover:text-gray-12 p-2 cursor-pointer">
                        <BiGridAlt className="text-lg sm:text-base" />
                    </IconButton>
                </Popover.Trigger>
                <Popover.Content size="1" className="p-0 overflow-hidden shadow-lg border border-gray-4 dark:border-gray-6">
                    <LauncherContent />
                </Popover.Content>
            </Popover.Root>
        )
    }

    return (
        <Drawer>
            <DrawerTrigger asChild>
                <IconButton variant="ghost" color="gray" className="text-gray-11 hover:text-gray-12 p-2">
                    <BiGridAlt className="text-lg sm:text-base" />
                </IconButton>
            </DrawerTrigger>
            <DrawerContent>
                <LauncherContent />
            </DrawerContent>
        </Drawer>
    )
}

export default AppLauncher
