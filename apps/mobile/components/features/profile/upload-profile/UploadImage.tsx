import { useFrappeFileUpload, useFrappePostCall } from 'frappe-react-sdk'
import { toast } from 'sonner-native'
import ImagePickerButton from '@components/common/Buttons/ImagePickerButton'
import { CustomFile } from '@axon/types/common/File'
import useCurrentAxonUser from '@axon/lib/hooks/useCurrentAxonUser'

interface UploadImageProps {
    onSheetClose: () => void
}

const UploadImage = ({ onSheetClose }: UploadImageProps) => {

    const { myProfile } = useCurrentAxonUser()

    const { call } = useFrappePostCall('axon.api.axon_users.update_axon_user')

    const { upload } = useFrappeFileUpload()

    const uploadImage = async (file: string) => {
        if (file) {
            try {
                await call({
                    user_image: file
                })
                toast.success("Image uploaded successfully.")
                onSheetClose()
            } catch (error) {
                toast.error('Error while uploading profile image')
            }
        }
    }

    const onPick = async (files: CustomFile[]) => {
        const file = files[0]

        if (file) {

            try {
                const res = await upload(file, {
                    doctype: "Axon User",
                    docname: myProfile?.name,
                    fieldname: "user_image",
                    otherData: {
                        optimize: '1',
                    },
                    isPrivate: false,
                })
                await uploadImage(res.file_url)
            } catch (error) {
                console.error(error)
                toast.error('Error uploading image')
            }

        }
    }

    return (
        <ImagePickerButton onPick={onPick} allowsMultipleSelection={false} />
    )
}

export default UploadImage