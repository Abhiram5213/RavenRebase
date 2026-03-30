import { Loader } from "@/components/common/Loader"
import MessageActionForm from "@/components/feature/message-actions/MessageActionForm"
import CommonSettingsMenu from "@/components/feature/settings/common/CommonSettingsMenu"
import { ErrorBanner } from "@/components/layout/AlertBanner/ErrorBanner"
import { FullPageLoader } from "@/components/layout/Loaders/FullPageLoader"
import PageContainer from "@/components/layout/Settings/PageContainer"
import SettingsContentContainer from "@/components/layout/Settings/SettingsContentContainer"
import SettingsPageHeader from "@/components/layout/Settings/SettingsPageHeader"
import { HStack } from "@/components/layout/Stack"
import { AxonMessageAction } from "@/types/AxonIntegrations/AxonMessageAction"
import { Button } from "@radix-ui/themes"
import { useFrappeGetDoc, useFrappeUpdateDoc, SWRResponse } from "frappe-react-sdk"
import { useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useParams } from "react-router-dom"
import { toast } from "sonner"

type Props = {}

const ViewMessageAction = (props: Props) => {

    const { ID } = useParams<{ ID: string }>()

    const { data, isLoading, error, mutate } = useFrappeGetDoc<AxonMessageAction>("Axon Message Action", ID)

    return (
        <PageContainer>
            <ErrorBanner error={error} />
            {isLoading && <FullPageLoader className="h-64" />}
            {data && <ViewMessageActionContent data={data} mutate={mutate} />}
        </PageContainer>
    )
}

const ViewMessageActionContent = ({ data, mutate }: { data: AxonMessageAction, mutate: SWRResponse['mutate'] }) => {

    const { updateDoc, loading, error } = useFrappeUpdateDoc<AxonMessageAction>()

    const methods = useForm<AxonMessageAction>({
        disabled: loading,
        defaultValues: data
    })

    const { formState: { isDirty } } = methods


    const onSubmit = (data: AxonMessageAction) => {
        updateDoc("Axon Message Action", data.name, data)
            .then((doc) => {
                toast.success("Saved")
                methods.reset(doc)
                mutate(doc, { revalidate: false })
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



    return <form onSubmit={methods.handleSubmit(onSubmit)}>
        <FormProvider {...methods}>
            <SettingsContentContainer>
                <SettingsPageHeader
                    title={data.action_name}
                    headerBadges={isDirty ? [{ label: "Not Saved", color: "red" }] : undefined}
                    actions={<HStack>
                        <CommonSettingsMenu doctype="Axon Message Action" docname={data.name} label={"Message Action"} />
                        <Button type='submit' disabled={loading}>
                            {loading && <Loader className="text-white" />}
                            {loading ? "Saving" : "Save"}
                        </Button>
                    </HStack>}
                    breadcrumbs={[{ label: 'Message Actions', href: '../' }, { label: data.action_name, href: '', copyToClipboard: true }]}
                />
                <ErrorBanner error={error} />
                <MessageActionForm />
            </SettingsContentContainer>
        </FormProvider>
    </form>

}

export const Component = ViewMessageAction