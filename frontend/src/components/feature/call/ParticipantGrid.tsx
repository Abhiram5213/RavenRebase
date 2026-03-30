import {
    GridLayout,
    ParticipantTile,
    useTracks,
    FocusLayout,
    useLocalParticipant,
} from "@livekit/components-react"
import { Track } from "livekit-client"

export const ParticipantGrid = () => {
    const tracks = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: true },
            { source: Track.Source.ScreenShare, withPlaceholder: false },
        ],
        { onlySubscribed: false }
    )

    // If someone is screen sharing, give them the focused layout
    const screenShareTrack = tracks.find(t => t.source === Track.Source.ScreenShare)

    if (screenShareTrack) {
        const others = tracks.filter(t => t !== screenShareTrack)
        return (
            <div className="flex flex-col h-full gap-1 p-1">
                <div className="flex-1 min-h-0">
                    <FocusLayout trackRef={screenShareTrack} />
                </div>
                {others.length > 0 && (
                    <div className="flex gap-1 h-24 overflow-x-auto">
                        {others.map(track => (
                            <div key={track.participant.identity} className="w-32 h-full shrink-0">
                                <ParticipantTile trackRef={track} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <GridLayout tracks={tracks} className="h-full w-full">
            <ParticipantTile />
        </GridLayout>
    )
}
