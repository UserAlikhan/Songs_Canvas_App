import { Group } from "fabric"

export type Song = {
    track: string,
    albumName: string,
    artist: string,
    allTimeRank: number,
    trackScore: number,
    spotifyPlaylistCount: number,
    spotifyPlaylistReach: number,
    spotifyPopularity: number,
    youtubeViews: number,
    youtubeLikes: number,
    tikTokPosts: number,
    tikTokLikes: number,
    tikTokViews: number,
    youtubePlaylistReach: number,
    appleMusicPlaylistCount: number,
    airPlaySpins: number,
    siriusXMSpins: number,
    deezerPlaylistCount: number,
    deezerPlaylistReach: number,
    amazonPlaylistCount: number,
    pandoraStreams: number,
    pandoraTrackStations: number,
    soundcloudStreams: number,
    shazamCounts: number,
    explicitTrack: number,
    categoryColor: string,
    categoryNodeColor: string
}

export type TrackWithId = Song & { id: string };

export interface ExtendedGroup extends Group {
    radius: number
}