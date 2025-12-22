import { NextResponse } from "next/server";
import { getRoom, saveRoom } from "@/lib/redis";
import { getRandomCategory } from "@/lib/words";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    const { code } = await params;

    const room = await getRoom(code.toUpperCase());

    if (!room) {
        return NextResponse.json({ error: "Sala no encontrada" }, { status: 404 });
    }

    // Siempre usar una categoría aleatoria
    const category = getRandomCategory();

    const resetRoom = {
        ...room,
        started: false,
        word: undefined,
        category,
        players: room.players.map((p) => ({
            id: p.id,
            name: p.name,
        })),
    };

    await saveRoom(resetRoom);

    return NextResponse.json({ success: true });
}