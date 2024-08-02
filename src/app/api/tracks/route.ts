import { prisma } from "@/utils/connect"
import { NextRequest, NextResponse } from "next/server"

export const GET = async (req: NextRequest) => {
    try {
        const url = req.nextUrl;
        const pageParam = url.searchParams.get('page');

        if (!pageParam) {
            return new NextResponse(JSON.stringify({ message: "Page parameter is missing!" }), { status: 400 })
        }

        const page = parseInt(pageParam, 10)

        const popularSongs = await prisma.popularSongs.findMany({ take: 10 * page })

        return new NextResponse(JSON.stringify(popularSongs), { status: 200 })
    } catch (err) {
        return new NextResponse(JSON.stringify(err), { status: 500 })
    }
}