import { NextResponse } from "next/server";
import { getRoom, saveRoom } from "@/lib/redis";
import { Category } from "@/lib/words";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    const { code } = await params;
    const body = await request.json().catch(() => ({}));
    const { category } = body as { category?: Category };

    const room = await getRoom(code.toUpperCase());

    if (!room) {
        return NextResponse.json({ error: "Sala no encontrada" }, { status: 404 });
    }

    const resetRoom = {
        ...room,
        started: false,
        word: undefined,
        category: category || room.category,
        players: room.players.map((p) => ({
            id: p.id,
            name: p.name,
        })),
    };

    await saveRoom(resetRoom);

    return NextResponse.json({ success: true });
}