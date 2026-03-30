import { BiInfoCircle } from "react-icons/bi"
import { Text } from "@radix-ui/themes"
import useAxonSettings from "@/hooks/fetchers/useAxonSettings"
import { CustomCallout } from "@/components/common/Callouts/CustomCallout"

const GoogleAPINotEnabledCallout = () => {

    const { axonSettings } = useAxonSettings()

    // Check if AI is enabled and at least one provider is configured
    const hasGoogleApis = axonSettings?.enable_google_apis === 1
    const hasGoogleProjectID = axonSettings?.google_project_id !== ''

    if (hasGoogleApis && hasGoogleProjectID) {
        return null
    }

    const message = !hasGoogleApis
        ? "Google APIs are not enabled. Please enable them in Axon Settings"
        : "No Google Project ID is set. Please set a Project ID in Axon Settings"

    return (
        <CustomCallout
            iconChildren={<BiInfoCircle size='18' />}
            rootProps={{ color: 'blue', variant: 'surface' }}
            textChildren={<Text>{message}</Text>}
        />
    )
}

export default GoogleAPINotEnabledCallout
