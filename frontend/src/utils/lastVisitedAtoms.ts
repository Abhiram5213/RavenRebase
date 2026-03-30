import { atomWithStorage } from "jotai/utils";

export const lastWorkspaceAtom = atomWithStorage<string>('axonLastWorkspace', '', undefined, {
    getOnInit: true
})
export const lastChannelAtom = atomWithStorage<string>('axonLastChannel', '', undefined, {
    getOnInit: true
})