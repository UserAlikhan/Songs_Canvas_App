import fs from 'fs'
import csv from 'csv-parser'
import { kmeans } from 'ml-kmeans'
import { PrismaClient } from "@prisma/client";


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
    tiktokPosts: number,
    tiktokLikes: number,
    tiktokViews: number,
    youtubePlaylistReach: number,
    appleMusicPlaylistCount: number,
    airplaySpins: number,
    siriusxmSpins: number,
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

const prisma = new PrismaClient()

async function readCSV(filePath: string): Promise<any[]> {
    const results: any[] = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on("end", () => resolve(results))
            .on('error', (error) => reject(error))
        })
}

export function calculateSimilarity(song1: any, song2: any) {
    const features1 = Object.values(song1).map(Number);
    const features2 = Object.values(song2).map(Number);

    // Вычисление скалярного произведения
    const dotProduct = features1.reduce((sum, value, index) => sum + value * features2[index], 0);

    // Вычисление норм векторов
    const magnitude1 = Math.sqrt(features1.reduce((sum, value) => sum + value * value, 0));
    const magnitude2 = Math.sqrt(features2.reduce((sum, value) => sum + value * value, 0));

    // Вычисление косинусного сходства
    const similarity = dotProduct / (magnitude1 * magnitude2);

    return similarity;
}

function categorizeSongs(songs: any[], similarities: any[]) {
    const threshold = 0.8
    const groups: any[][] = [];

    songs.forEach(song => {
        const newGroup = [song]
        groups.push(newGroup)
    })

    // Группировка песен
    similarities.forEach(similarity => {
        if (similarity.value > threshold) {
            const song1 = similarity.song1
            const song2 = similarity.song2

            let group1: any[] | undefined
            let group2: any[] | undefined

            // найти группы в которых находятся song1 и song2
            for (const group of groups) {
                if (group.includes(song1)) {
                    group1 = group
                }
                if (group.includes(song2)) {
                    group2 = group
                }
            }

            // если обе песни находятся в разных группах объединить песни
            if (group1 && group2 && group1 !== group2) {
                group1.push(...group2)
                groups.splice(groups.indexOf(group2), 1)
            }
        }
    })
    // присвоение цветов группам
    const colors = ['red', 'blue', 'green', 'yellow', 'purple'];
    const colorsNode = ['purple', 'pink', 'red', 'black', 'yellow'];
    groups.forEach((group, index) => {
        const color = colors[index % colors.length]
        const colorNode = colorsNode[index % colorsNode.length]

        group.forEach(song => {
            song.categoryColor = color;
            song.categoryNodeColor = colorNode;
        });
    })

    console.log('groups ', groups)

    const categorizedSongs = groups.flat()
    console.log('categorizedSongs ', categorizedSongs)
    console.log('categorizedSongs.length ', categorizedSongs.length)
    return categorizedSongs
}

function clusterSongs(songs: any[], k: number) {
    const vectors = songs.map(song => Object.values(song).map(Number));
    const clusters = kmeans(vectors, k, { initialization: 'random' })
    return clusters;
}

function combineArrays(array1: any[], array2: any[]): Song[] {
    if (array1.length !== array2.length) {
        throw new Error('Both arrays must have the same length');
    }
    return array1.map((item, index) => ({ ...item, ...array2[index] }));
}

async function saveSongs(songs: any[]) {
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

async function runAll() {
    try {
        const filePath: string = 'C:/Code/spotify-next-app/src/data/dt.csv'
        const filePathCategories: string = 'C:/Code/spotify-next-app/src/data/dc.csv'

        const songs = await readCSV(filePath)
        const categories = await readCSV(filePathCategories)

        console.log(songs)
        console.log('categories ', categories)
        const similarities: any= []
        for (let i = 0; i < songs.length; i++) {
            for (let j = i + 1; j < songs.length; j++) {
                const similarity = calculateSimilarity(songs[i], songs[j])
                // console.log('similarity ', similarity)
                similarities.push({ song1: songs[i], song2: songs[j], value: similarity })
            }
        }
        
        console.log('SIMILARITIES FINAL ', similarities)

        const categorizedSongs = categorizeSongs(songs, similarities)
        console.log('categorizedSongs ', categorizedSongs)

        const classterizedDataset: Song[] = combineArrays(categories, categorizedSongs)
        console.log('classterizedDataset ', classterizedDataset[0])

        await saveSongs(classterizedDataset)

        // const clusters = clusterSongs(songs, 5)
        // console.log('clusters ', clusters)
        // const colors = ['Green', 'Blue', 'Yellow', 'Purple', 'Pink']
        // const nodeColors = ['Red', 'Orange', "Black", "Yellow", "Green"]

        // for (let i = 0; i < songs.length; i++) {
        //     const song = songs[i];
        //     const cluster = clusters.clusters[i];
        //     song.categoryColor = colors[cluster];
        //     song.categoryNodeColor = nodeColors[cluster];
        // }
        // const classterizedDataset: Song[] = combineArrays(categories, songs)
        // console.log('classterizedDataset ', classterizedDataset[0])

        // await saveSongs(classterizedDataset)
    } catch (error) {
        console.error('Error processing data:', error)
    }
}

runAll()