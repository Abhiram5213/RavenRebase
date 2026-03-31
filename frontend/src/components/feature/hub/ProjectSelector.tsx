import { Badge, Box, Flex, Popover, Text, TextField } from '@radix-ui/themes'
import { useFrappeGetCall, useFrappePostCall, useSWRConfig } from 'frappe-react-sdk'
import { useState } from 'react'
import { BiFolder, BiSearch } from 'react-icons/bi'
import { __ } from '@/utils/translations'
import { toast } from 'sonner'

interface ProjectSelectorProps {
    channelId: string
    currentProject?: string
}

interface HubProject {
    name: string
    project_name: string
}

const ProjectSelector = ({ channelId, currentProject }: ProjectSelectorProps) => {
    const { data: projectsData, isLoading } = useFrappeGetCall<{ message: HubProject[] }>(
        'axon.api.hub.get_projects',
        {}
    )
    const { call: setProject } = useFrappePostCall('axon.api.hub.set_channel_project')
    const { mutate } = useSWRConfig()
    
    const [search, setSearch] = useState('')

    const projects = projectsData?.message || []
    const filteredProjects = projects.filter(p => 
        p.project_name.toLowerCase().includes(search.toLowerCase())
    )

    const handleSelect = async (projectName: string | null) => {
        try {
            await setProject({
                channel_id: channelId,
                hub_project: projectName
            })
            toast.success(__("Project updated"))
            mutate('channel_list')
        } catch (e) {
            toast.error(__("Failed to update project"))
        }
    }

    return (
        <Popover.Root>
            <Popover.Trigger>
                <button className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                    {currentProject ? (
                        <Badge color="iris" variant="soft" className="cursor-pointer">
                            <BiFolder className="mr-1" />
                            {currentProject}
                        </Badge>
                    ) : (
                        <Badge color="gray" variant="outline" className="cursor-pointer opacity-50 hover:opacity-100">
                            <BiFolder className="mr-1" />
                            {__("No Project")}
                        </Badge>
                    )}
                </button>
            </Popover.Trigger>
            <Popover.Content size="1" className="p-0 w-64 overflow-hidden shadow-lg border border-gray-4 dark:border-gray-6">
                <Box p="2" className="border-b border-gray-3 bg-gray-2">
                    <TextField.Root
                        placeholder={__("Search projects...")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        size="1"
                    >
                        <TextField.Slot>
                            <BiSearch />
                        </TextField.Slot>
                    </TextField.Root>
                </Box>
                <Box className="max-h-64 overflow-y-auto">
                    {currentProject && (
                        <button 
                            onClick={() => handleSelect(null)}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-gray-3 transition-colors text-red-11"
                        >
                            {__("Clear Project")}
                        </button>
                    )}
                    {filteredProjects.map((project) => (
                        <button
                            key={project.name}
                            onClick={() => handleSelect(project.name)}
                            className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-3 transition-colors flex items-center justify-between ${currentProject === project.name ? 'bg-gray-3 font-bold' : ''}`}
                        >
                            <Flex align="center" gap="2">
                                <BiFolder className="text-gray-10" />
                                <Text>{project.project_name}</Text>
                            </Flex>
                            {currentProject === project.name && <Text size="1">✓</Text>}
                        </button>
                    ))}
                    {filteredProjects.length === 0 && !isLoading && (
                        <Box p="3" className="text-center">
                            <Text size="1" color="gray">{__("No projects found")}</Text>
                        </Box>
                    )}
                </Box>
            </Popover.Content>
        </Popover.Root>
    )
}

export default ProjectSelector
