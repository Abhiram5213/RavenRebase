import { router, useLocalSearchParams } from "expo-router"
import { useCallActions } from "@hooks/call/useCallActions"
import { View, Text, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useGetUser } from "@axon/lib/hooks/useGetUser"
import Ionicons from "@expo/vector-icons/Ionicons"

/**
 * Full-screen incoming call screen.
 * Navigated to by the FCM push notification payload:
 *   { call_id, channel_id, initiated_by }
 */
export default function IncomingCallScreen() {
    const { call_id, channel_id, initiated_by } = useLocalSearchParams<{
        call_id: string
        channel_id: string
        initiated_by: string
    }>()

    const { joinCall } = useCallActions()
    const caller = useGetUser(initiated_by ?? "")
    const callerName = caller?.full_name ?? initiated_by

    const handleAccept = async () => {
        await joinCall(call_id, channel_id)
        router.replace(`/${router.getState?.()?.routes?.[0]?.params?.site_id ?? ""}/chat/${channel_id}`)
    }

    const handleDecline = () => {
        router.back()
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#0a0a0a" }}>
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 24 }}>
                {/* Caller info */}
                <View style={{ alignItems: "center", gap: 12 }}>
                    <View
                        style={{
                            width: 96,
                            height: 96,
                            borderRadius: 48,
                            backgroundColor: "#22c55e22",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Ionicons name="person" size={48} color="#22c55e" />
                    </View>
                    <Text style={{ color: "#fff", fontSize: 28, fontWeight: "700" }}>
                        {callerName}
                    </Text>
                    <Text style={{ color: "#fff", opacity: 0.5, fontSize: 16 }}>
                        Incoming video call…
                    </Text>
                </View>

                {/* Accept / Decline */}
                <View style={{ flexDirection: "row", gap: 48, marginTop: 48 }}>
                    {/* Decline */}
                    <TouchableOpacity
                        onPress={handleDecline}
                        activeOpacity={0.8}
                        style={{ alignItems: "center", gap: 8 }}
                    >
                        <View
                            style={{
                                width: 72,
                                height: 72,
                                borderRadius: 36,
                                backgroundColor: "#ef4444",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <Ionicons
                                name="call"
                                size={32}
                                color="#fff"
                                style={{ transform: [{ rotate: "135deg" }] }}
                            />
                        </View>
                        <Text style={{ color: "#fff", opacity: 0.7, fontSize: 13 }}>Decline</Text>
                    </TouchableOpacity>

                    {/* Accept */}
                    <TouchableOpacity
                        onPress={handleAccept}
                        activeOpacity={0.8}
                        style={{ alignItems: "center", gap: 8 }}
                    >
                        <View
                            style={{
                                width: 72,
                                height: 72,
                                borderRadius: 36,
                                backgroundColor: "#22c55e",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <Ionicons name="videocam" size={32} color="#fff" />
                        </View>
                        <Text style={{ color: "#fff", opacity: 0.7, fontSize: 13 }}>Accept</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}
