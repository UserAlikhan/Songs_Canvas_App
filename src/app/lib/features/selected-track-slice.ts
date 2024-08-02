import { TrackWithId } from "@/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type InitialState = {
    value: TrackWithId
}

const initialState = {
    value: {
        track: "",
        albumName: "",
        artist: "",
        allTimeRank: 0,
        trackScore: 0,
        spotifyPlaylistCount: 0,
        spotifyPlaylistReach: 0,
        spotifyPopularity: 0,
        youtubeViews: 0,
        youtubeLikes: 0,
        tikTokPosts: 0,
        tikTokLikes: 0,
        tikTokViews: 0,
        youtubePlaylistReach: 0,
        appleMusicPlaylistCount: 0,
        airPlaySpins: 0,
        siriusXMSpins: 0,
        deezerPlaylistCount: 0,
        deezerPlaylistReach: 0,
        amazonPlaylistCount: 0,
        pandoraStreams: 0,
        pandoraTrackStations: 0,
        soundcloudStreams: 0,
        shazamCounts: 0,
        explicitTrack: 0,
        categoryColor: '',
        categoryNodeColor: ''
    } as TrackWithId,
} as InitialState

const selectedTrack = createSlice({
    name: 'selectTrack',
    initialState,
    reducers: {
        deleteSelectedTrack: () => {
            return initialState;
        },
        setSelectedTrack: (state, action: PayloadAction<TrackWithId>) => {
            return {
                value: action.payload
            }
        }
    }
})

export const { deleteSelectedTrack, setSelectedTrack } = selectedTrack.actions;
export default selectedTrack.reducer;