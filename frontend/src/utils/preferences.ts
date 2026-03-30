import { atomWithStorage } from "jotai/utils"

export const EnterKeyBehaviourAtom = atomWithStorage<"new-line" | "send-message">("axon-enter-key-behaviour", "send-message", undefined, { getOnInit: true })

export const QuickEmojisAtom = atomWithStorage<string[]>("axon-quick-emojis", ["👍", "✅", "👀", "🎉"])