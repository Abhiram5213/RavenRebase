import { useAtomValue } from "jotai"
import { incomingCallAtom } from "@utils/callAtoms"
import { useCallActions } from "@hooks/call/useCallActions"
import { View, Text, TouchableOpacity } from "react-native"
import { useGetUser } from "@axon/lib/hooks/useGetUser"
import Ionicons from "@expo/vector-icons/Ionicons"

export const IncomingCallBanner = () => {
    const incoming = useAtomValue(incomingCallAtom)
    const { joinCall, dismissIncomingCall } = useCallActions()
    const caller = useGetUser(incoming?.initiated_by ?? "")

    if (!incoming) return null

    const callerName = caller?.full_name ?? incoming.initiated_by

    return (
        <View
            style={{
                position: "absolute",
                top: 60,
                left: 16,
                right: 16,
                zIndex: 999,
                backgroundColor: "#1c1c1e",
                borderRadius: 16,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 10,
            }}
        >
            <View
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "#22c55e22",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Ionicons name="videocam" size={20} color="#22c55e" />
            </View>

            <View style={{ flex: 1 }}>
                <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>
                    {callerName}
                </Text>
                <Text style={{ color: "#fff", opacity: 0.6, fontSize: 12 }}>
                    started a call
                </Text>
            </View>

            <TouchableOpacity
                onPress={dismissIncomingCall}
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "#ef444422",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Ionicons name="call" size={20} color="#ef4444" style={{ transform: [{ rotate: "135deg" }] }} />
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => joinCall(incoming.call_id, incoming.channel_id)}
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "#22c55e",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Ionicons name="videocam" size={20} color="#fff" />
            </TouchableOpacity>
        </View>
    )
}
