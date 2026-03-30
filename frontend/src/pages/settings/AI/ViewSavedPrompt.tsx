import { Loader } from "@/components/common/Loader"
import SavedPromptForm from "@/components/feature/settings/ai/SavedPromptForm"
import CommonSettingsMenu from "@/components/feature/settings/common/CommonSettingsMenu"
import { ErrorBanner } from "@/components/layout/AlertBanner/ErrorBanner"
import { FullPageLoader } from "@/components/layout/Loaders/FullPageLoader"
import PageContainer from "@/components/layout/Settings/PageContainer"
import SettingsContentContainer from "@/components/layout/Settings/SettingsContentContainer"
import SettingsPageHeader from "@/components/layout/Settings/SettingsPageHeader"
import { HStack } from "@/components/layout/Stack"
import { AxonBotAIPrompt } from "@/types/AxonAI/AxonBotAIPrompt"
import { isEmpty } from "@/utils/validations"
import { Button } from "@radix-ui/themes"
import { SWRResponse, useFrappeGetDoc, useFrappeUpdateDoc } from "frappe-react-sdk"
import { useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useParams } from "react-router-dom"
import { toast } from "sonner"

type Props = {}

const ViewSavedPrompt = (props: Props) => {

    const { ID } = useParams<{ ID: string }>()

    const { data, isLoading, error, mutate } = useFrappeGetDoc<AxonBotAIPrompt>("Axon Bot AI Prompt", ID)

    return (
        <PageContainer>
            <ErrorBanner error={error} />
            {isLoading && <FullPageLoader className="h-64" />}
            {data && <ViewSavedPromptContent data={data} mutate={mutate} />}
        </PageContainer>
    )
}

const ViewSavedPromptContent = ({ data, mutate }: { data: AxonBotAIPrompt, mutate: SWRResponse['mutate'] }) => {

    const { updateDoc, loading, error } = useFrappeUpdateDoc<AxonBotAIPrompt>()

    const methods = useForm<AxonBotAIPrompt>({
        disabled: loading,
        defaultValues: data
    })

    const { formState: { dirtyFields } } = methods

    const isDirty = !isEmpty(dirtyFields)


    const onSubmit = (data: AxonBotAIPrompt) => {
        updateDoc("Axon Bot AI Prompt", data.name, data)
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
                    title={data.name}
                    headerBadges={isDirty ? [{ label: "Not Saved", color: "red" }] : undefined}
                    actions={<HStack>
                        <CommonSettingsMenu doctype="Axon Bot AI Prompt" docname={data.name} label={"Saved Prompt/Command"} />
                        <Button type='submit' disabled={loading}>
                            {loading && <Loader className="text-white" />}
                            {loading ? "Saving" : "Save"}
                        </Button>
                    </HStack>}
                    breadcrumbs={[{ label: 'Commands', href: '../' }, { label: data.name, href: '', copyToClipboard: true }]}
                />
                <ErrorBanner error={error} />
                <SavedPromptForm />
            </SettingsContentContainer>
        </FormProvider>
    </form>

}

export const Component = ViewSavedPrompt