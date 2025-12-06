import { NextResponse } from "next/server";
import { generateRoomCode, Room } from "@/lib/game-logic";
import { saveRoom, getRoom } from "@/lib/redis";
import { Category } from "@/lib/words";

export async function POST(request: Request) {
    const body = await request.json();
    const { category, impostorCount } = body as {
        category: Category;
        impostorCount: number;
    };

    // Generar código único
    let code = generateRoomCode();
    while (await getRoom(code)) {
        code = generateRoomCode();
    }

    const room: Room = {
        code,
        category,
        impostorCount,
        players: [],
        started: false,
    };

    await saveRoom(room);

    return NextResponse.json({ code });
}