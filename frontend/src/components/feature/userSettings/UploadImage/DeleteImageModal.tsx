import { useFrappePostCall } from 'frappe-react-sdk'
import { toast } from 'sonner'
import { AlertDialog, Button, Flex, Text } from '@radix-ui/themes'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { Loader } from '@/components/common/Loader'
import useCurrentAxonUser from '@/hooks/useCurrentAxonUser'
import { __ } from '@/utils/translations'

interface DeleteImageModalProps {
    onClose: () => void
}

export const DeleteImageModal = ({ onClose }: DeleteImageModalProps) => {

    const { call, loading, error } = useFrappePostCall('axon.api.axon_users.update_axon_user')
    const { mutate } = useCurrentAxonUser()

    const removeImage = () => {
        call({
            user_image: ''
        }).then(() => {
            toast.success("Profile picture removed.")
            mutate()
            onClose()
        })
    }

    return (
        <>
            <AlertDialog.Title>{__("Remove Image")}</AlertDialog.Title>

            <Flex direction={'column'} gap='2'>
                <ErrorBanner error={error} />
                <Text>{__("Are you sure you want to remove this image?")}</Text>
            </Flex>

            <Flex gap="3" mt="4" justify="end">
                <AlertDialog.Cancel>
                    <Button variant="soft" color="gray">
                        {__("Cancel")}
                    </Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action>
                    <Button variant="solid" color="red" onClick={removeImage} disabled={loading}>
                        {loading && <Loader />}
                        {loading ? __("Removing") : __("Remove")}
                    </Button>
                </AlertDialog.Action>
            </Flex>
        </>
    )
}