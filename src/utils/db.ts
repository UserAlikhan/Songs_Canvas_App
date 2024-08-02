import { PrismaClient } from "@prisma/client/extension";

const prisma = new PrismaClient()

export async function saveSongs(songs: any[]) {
    for (const song of songs) {
        console.log('song ', song)
        console.log('track ', song.tiktokPosts)
      await prisma.popularSongs.create({
        data: {
          track: song.track,
          albumName: song.albumName,
          artist: song.artist,
          allTimeRank: parseFloat(song.allTimeRank),
          trackScore:  parseFloat(song.trackScore),
          spotifyPlaylistCount:  parseFloat(song.spotifyPlaylistCount),
          spotifyPlaylistReach:  parseFloat(song.spotifyPlaylistReach),
          spotifyPopularity:  parseFloat(song.spotifyPopularity),
          youtubeViews:  parseFloat(song.youtubeViews),
          youtubeLikes:  parseFloat(song.youtubeLikes),
          tiktokPosts:  parseFloat(song.tiktokPosts),
          tiktokLikes:  parseFloat(song.tiktokLikes),
          tiktokViews:  parseFloat(song.tiktokViews),
          youtubePlaylistReach:  parseFloat(song.youtubePlaylistReach),
          appleMusicPlaylistCount:  parseFloat(song.appleMusicPlaylistCount),
          airplaySpins:  parseFloat(song.airplaySpins),
          siriusxmSpins:  parseFloat(song.siriusxmSpins),
          deezerPlaylistCount:  parseFloat(song.deezerPlaylistCount),
          deezerPlaylistReach:  parseFloat(song.deezerPlaylistReach),
          amazonPlaylistCount:  parseFloat(song.amazonPlaylistCount),
          pandoraStreams:  parseFloat(song.pandoraStreams),
          pandoraTrackStations:  parseFloat(song.pandoraTrackStations),
          soundcloudStreams:  parseFloat(song.soundcloudStreams),
          shazamCounts:  parseFloat(song.shazamCounts),
          explicitTrack:  parseFloat(song.explicitTrack),
          categoryColor: song.categoryColor,
          categoryNodeColor: song.categoryNodeColor,
        },
      });
    }
}