import { NextResponse } from "next/server"

export const GET = async () => {
    try {
        return new NextResponse("HELLO", { status: 200 })
    } catch (err) {
        return new NextResponse(JSON.stringify({ message: "Something went wrong!" }), { status: 500 })
    }
}