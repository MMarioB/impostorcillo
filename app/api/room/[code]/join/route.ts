import { NextResponse } from "next/server";
import { getRoom, saveRoom } from "@/lib/redis";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    const { code } = await params;
    const body = await request.json();
    const { name } = body as { name: string };

    if (!name || name.trim().length === 0) {
        return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    }

    const room = await getRoom(code.toUpperCase());

    if (!room) {
        return NextResponse.json({ error: "Sala no encontrada" }, { status: 404 });
    }

    if (room.started) {
        return NextResponse.json({ error: "La partida ya ha comenzado" }, { status: 400 });
    }

    // Generar ID único para el jugador
    const playerId = crypto.randomUUID();

    room.players.push({
        id: playerId,
        name: name.trim(),
    });

    await saveRoom(room);

    return NextResponse.json({ playerId });
}