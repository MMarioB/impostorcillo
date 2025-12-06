import { NextResponse } from "next/server";
import { getRoom } from "@/lib/redis";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    const { code } = await params;
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get("playerId");

    const room = await getRoom(code.toUpperCase());

    if (!room) {
        return NextResponse.json({ error: "Sala no encontrada" }, { status: 404 });
    }

    // Si la partida no ha empezado, devolver todo (sin info sensible)
    if (!room.started) {
        return NextResponse.json({
            code: room.code,
            category: room.category,
            impostorCount: room.impostorCount,
            players: room.players.map((p) => ({ id: p.id, name: p.name })),
            started: room.started,
        });
    }

    // Si ha empezado, cada jugador solo ve su propia info
    const players = room.players.map((p) => ({
        id: p.id,
        name: p.name,
        isImpostor: p.id === playerId ? p.isImpostor : undefined,
        word: p.id === playerId ? p.word : undefined,
    }));

    return NextResponse.json({
        code: room.code,
        category: room.category,
        impostorCount: room.impostorCount,
        players,
        started: room.started,
        word: playerId ? undefined : room.word, // Solo el organizador ve la palabra
    });
}