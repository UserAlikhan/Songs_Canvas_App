import { PrismaClient } from "@prisma/client/extension";

const prisma = new PrismaClient()

export async function saveSongs(songs: any[]) {
    for (const song of songs) {
        await prisma.popularSongs.create({
            data: song
        })
    }
}