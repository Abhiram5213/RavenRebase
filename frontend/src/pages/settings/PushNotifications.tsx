import { CustomCallout } from '@/components/common/Callouts/CustomCallout'
import { HelperText } from '@/components/common/Form'
import { ErrorText } from '@/components/common/Form'
import { Label } from '@/components/common/Form'
import { Loader } from '@/components/common/Loader'
import { ErrorBanner, getErrorMessage } from '@/components/layout/AlertBanner/ErrorBanner'
import PageContainer from '@/components/layout/Settings/PageContainer'
import SettingsContentContainer from '@/components/layout/Settings/SettingsContentContainer'
import SettingsPageHeader from '@/components/layout/Settings/SettingsPageHeader'
import { Stack } from '@/components/layout/Stack'
import useAxonSettings from '@/hooks/fetchers/useAxonSettings'
import { AxonSettings } from '@/types/Axon/AxonSettings'
import { isSystemManager } from '@/utils/roles'
import { __ } from '@/utils/translations'
import { Box, Button, Link, Select, Strong, Text, TextField } from '@radix-ui/themes'
import { FrappeConfig, FrappeContext, useFrappePostCall, useFrappeUpdateDoc } from 'frappe-react-sdk'
import { useContext, useEffect } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { FiAlertTriangle, FiExternalLink } from 'react-icons/fi'
import { toast } from 'sonner'

const PushNotifications = () => {

    const isAxonAdmin = isSystemManager()

    const { axonSettings, mutate, error } = useAxonSettings()

    const { call } = useContext(FrappeContext) as FrappeConfig

    const methods = useForm<AxonSettings>({
        disabled: !isAxonAdmin
    })

    const { handleSubmit, control, watch, reset, register, formState: { errors }, setValue } = methods

    useEffect(() => {
        if (axonSettings) {
            reset(axonSettings)
        }
    }, [axonSettings])

    const { updateDoc, loading: updatingDoc } = useFrappeUpdateDoc<AxonSettings>()

    const onSubmit = (data: AxonSettings) => {
        toast.promise(updateDoc('Axon Settings', null, {
            ...(axonSettings ?? {}),
            ...data
        }).then(res => {
            mutate(res, {
                revalidate: false
            })
        }), {
            loading: 'Updating...',
            success: () => {
                return `Settings updated`;
            },
            error: 'There was an error.',
        })

    }

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                methods.handleSubmit(onSubmit)()
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    const isAxonCloud = watch('push_notification_service') === "Axon"

    return (
        <PageContainer>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <SettingsContentContainer>
                        <SettingsPageHeader
                            title={__('Push Notifications')}
                            description={__("Configure the push notification service here.")}
                            actions={<Button type='submit' disabled={updatingDoc || !isAxonAdmin}>
                                {updatingDoc && <Loader className="text-white" />}
                                {updatingDoc ? "Saving" : "Save"}
                            </Button>}
                        />
                        {!isAxonAdmin && <CustomCallout
                            iconChildren={<FiAlertTriangle />}
                            rootProps={{ color: 'blue', variant: 'surface' }}
                            textChildren={__("You need to be a System Manager to manage the push notification service.")} >
                        </CustomCallout>}
                        <ErrorBanner error={error} />

                        <Text size='2'>To send push notifications, you have two options:
                            <br />
                            <br />
                            <ol className='list-decimal list-inside'>
                                <li>
                                    <Strong>Axon Cloud</Strong> - recommended for all users, including those on Frappe Cloud. For self-hosted instances, this is the only option.
                                </li>
                                <li>
                                    <Strong>Frappe Cloud</Strong> - alternative option available only for Frappe Cloud users.
                                </li>
                            </ol>
                        </Text>

                        <Box className='max-w-96'>
                            <Label isRequired htmlFor='push_notification_service'>{__("Push Notification Service")}</Label>
                            <Controller
                                control={control}
                                defaultValue={axonSettings?.push_notification_service}
                                name='push_notification_service'
                                rules={{
                                    required: "Please select a push notification service",
                                    onChange: (e) => {
                                        setValue('push_notification_server_url', 'https://cloud.axonchat.ai')
                                    }
                                }}
                                render={({ field }) => (
                                    <Select.Root
                                        value={field.value}
                                        disabled={field.disabled}
                                        name={field.name}
                                        onValueChange={field.onChange}>
                                        <Select.Trigger className='w-full' />
                                        <Select.Content>
                                            <Select.Item value='Axon'>
                                                {__("Axon Cloud")}
                                            </Select.Item>
                                            <Select.Item value='Frappe Cloud'>
                                                {__("Frappe Cloud")}
                                            </Select.Item>
                                        </Select.Content>
                                    </Select.Root>
                                )}
                            />
                            <HelperText>We recommend using Axon Cloud for push notifications.</HelperText>
                        </Box>

                        {isAxonCloud ?
                            <Stack gap='3'>
                                <Text size='2'>
                                    To get started with Axon Cloud, you need to first <Link href="https://cloud.axonchat.ai" target='_blank'>create an account <FiExternalLink /></Link> and get your API Key and API Secret.
                                </Text>
                                <Box>
                                    <Label htmlFor='push_notification_server_url' isRequired>Push Notification Server URL</Label>
                                    <TextField.Root
                                        autoFocus
                                        maxLength={140}
                                        className={'w-48 sm:w-96'}
                                        id='push_notification_server_url'
                                        autoComplete='off'
                                        required
                                        placeholder='https://push.axon.chat'
                                        {...register('push_notification_server_url', {
                                            required: isAxonCloud ? "Please add your Push Notification Server URL" : false,
                                            maxLength: {
                                                value: 300,
                                                message: "URL cannot be more than 300 characters."
                                            }
                                        })}
                                        aria-invalid={errors.push_notification_server_url ? 'true' : 'false'}
                                    />
                                    {errors?.push_notification_server_url && <ErrorText>{errors.push_notification_server_url?.message}</ErrorText>}
                                    <HelperText size='2'>
                                        You can keep this as "https://cloud.axonchat.ai" if you are using the default Axon Cloud instance.
                                        <br />
                                        Only change this if you are using a custom Axon Cloud instance.
                                    </HelperText>
                                </Box>

                                <Box>
                                    <Label htmlFor='push_notification_api_key'>Push Notification API Key</Label>
                                    <TextField.Root
                                        maxLength={140}
                                        className={'w-48 sm:w-96'}
                                        id='push_notification_api_key'
                                        autoComplete='off'
                                        placeholder='Your API Key'
                                        {...register('push_notification_api_key', {
                                            maxLength: {
                                                value: 140,
                                                message: "API Key cannot be more than 140 characters."
                                            }
                                        })}
                                        aria-invalid={errors.push_notification_api_key ? 'true' : 'false'}
                                    />
                                    {errors?.push_notification_api_key && <ErrorText>{errors.push_notification_api_key?.message}</ErrorText>}
                                </Box>
                                <Box>
                                    <Label htmlFor='push_notification_api_secret' isRequired>API Secret</Label>
                                    <TextField.Root
                                        className={'w-48 sm:w-96'}
                                        id='push_notification_api_secret'
                                        required
                                        type='password'
                                        autoComplete='off'
                                        placeholder='••••••••••••••••••••••••••••••••'
                                        {...register('push_notification_api_secret', {
                                            required: isAxonCloud ? "Please add your Push Notification API Secret" : false,
                                        })}
                                        aria-invalid={errors.push_notification_api_secret ? 'true' : 'false'}
                                    />
                                    {errors?.push_notification_api_secret && <ErrorText>{errors.push_notification_api_secret?.message}</ErrorText>}
                                </Box>
                            </Stack>
                            : null
                        }


                        <div className='flex gap-2'>
                            {isAxonCloud && axonSettings?.push_notification_service === "Axon" && axonSettings?.push_notification_server_url &&
                                <RegisterSiteButton mutate={mutate} axonSettings={axonSettings} />}

                            {isAxonCloud && axonSettings?.push_notification_service === "Axon"
                                && axonSettings?.push_notification_server_url && axonSettings?.vapid_public_key && <SyncDataButton />}

                            {!isAxonCloud && <Button
                                asChild
                                color='gray'
                                variant='outline'
                                className='not-cal'>
                                <Link color='gray'
                                    target='_blank'
                                    underline='none'
                                    href={`/app/push-notification-settings`}>

                                    Configure Frappe Push Notifications
                                    <FiExternalLink />
                                </Link>
                            </Button>
                            }
                        </div>

                    </SettingsContentContainer>
                </form>
            </FormProvider>
        </PageContainer>
    )
}

const RegisterSiteButton = ({ mutate, axonSettings }: { mutate: VoidFunction, axonSettings: AxonSettings }) => {

    const { call, loading } = useFrappePostCall('axon.api.notification.register_site_on_axon_cloud')

    const registerSite = () => {
        toast.promise(call({}).then(() => mutate()), {
            loading: 'Registering site on Axon Cloud...',
            success: 'Site registered on Axon Cloud. You can now send push notifications.',
            error: (error) => 'Failed to register site on Axon Cloud. ' + (getErrorMessage(error))
        })
    }

    return <Button
        onClick={registerSite}
        disabled={loading}
        variant='soft'
        type='button'
        className='not-cal'>{axonSettings.vapid_public_key ? "Re-Register Site on Axon Cloud" : "Register Site on Axon Cloud"}</Button>

}

const SyncDataButton = () => {
    const { call, loading } = useFrappePostCall('axon.api.notification.sync_user_tokens_to_axon_cloud')

    const syncData = () => {
        toast.promise(call({}), {
            loading: 'Syncing data to Axon Cloud...',
            success: 'Data synced to Axon Cloud.',
            error: (error) => 'Failed to sync data to Axon Cloud. ' + (getErrorMessage(error))
        })
    }

    return <Button
        onClick={syncData}
        disabled={loading}
        variant='soft'
        type='button'
        className='not-cal'>
        {loading ? "Syncing Data to Axon Cloud..." : "Sync Data to Axon Cloud"}
    </Button>
}

export const Component = PushNotifications
