// Скрипт для расчета сходства, используется метрика Косинусного Сходства
import fs from 'fs'
import csv from 'csv-parser'
import { kmeans } from 'ml-kmeans'
import { PrismaClient } from "@prisma/client";
// import { readCSV } from '@/utils/readCSV';
// import { calculateSimilarity } from '@/utils/calculateSimilarity';
// import { categorizeSongs } from '@/utils/categorizeSongs';
// import { Song } from '@/types/types';
// import { saveSongs } from '@/utils/db';
// import { combineArrays } from '@/utils/combineArrays';

// Ожидаемый тип
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
// Экземпляр класса PrismaClient
const prisma = new PrismaClient()
// Функция для чтения CSV файла
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
// Функция для вычисление Косинусного Сходства
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
// Функция для категаризации треков
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

    const categorizedSongs = groups.flat()
    return categorizedSongs
}
// Функция для объядинения двух массивов
function combineArrays(array1: any[], array2: any[]): Song[] {
    if (array1.length !== array2.length) {
        throw new Error('Both arrays must have the same length');
    }
    return array1.map((item, index) => ({ ...item, ...array2[index] }));
}
// Функция для сохранения данных в базу данных
async function saveSongs(songs: any[]) {
    for (const song of songs) {

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
// Главная функция для запуска скрипта
async function runAll() {
    try {
        const filePath: string = 'C:/Code/spotify-next-app/src/data/dt_cropped.csv'
        const filePathCategories: string = 'C:/Code/spotify-next-app/src/data/dc_cropped.csv'

        const songs = await readCSV(filePath)
        const categories = await readCSV(filePathCategories)

        const similarities: any= []
        for (let i = 0; i < songs.length; i++) {
            for (let j = i + 1; j < songs.length; j++) {
                const similarity = calculateSimilarity(songs[i], songs[j])
                similarities.push({ song1: songs[i], song2: songs[j], value: similarity })
            }
        }
        
        const categorizedSongs = categorizeSongs(songs, similarities)

        const classterizedDataset: Song[] = combineArrays(categories, categorizedSongs)

        // await saveSongs(classterizedDataset)
        
    } catch (error) {
        console.error('Error processing data:', error)
    }
}

runAll()