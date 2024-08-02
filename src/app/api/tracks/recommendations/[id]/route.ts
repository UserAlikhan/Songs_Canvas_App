import { prisma } from "@/utils/connect"
import { NextRequest, NextResponse } from "next/server"

export const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {   
        const { id } = params;

        const url  = req.nextUrl;
        const pageParam = url.searchParams.get('page');

        if (!pageParam) {
            return new NextResponse(JSON.stringify("Please specify page parameter"))
        }

        const track = await prisma.popularSongs.findUnique({
            where: {
                id: id
            }
        })
        if (!track) {
            return new NextResponse(JSON.stringify("No such track. Invalid parameter"))
        }
        
        const recommendation = await prisma.popularSongs.findMany({
            where: {
                id: {
                    not: id
                },
                categoryColor: track.categoryColor,
                categoryNodeColor: track.categoryNodeColor
            },
            take: 10 * parseInt(pageParam, 10)
        })

        return new NextResponse(JSON.stringify(recommendation), { status: 200 })
    } catch (err) {
        return new NextResponse(JSON.stringify({ message: "Something went wrong!" }), { status: 500 })
    }
}