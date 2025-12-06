import { NextResponse } from "next/server";
import { getRoom, saveRoom } from "@/lib/redis";
import { assignRoles } from "@/lib/game-logic";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    const { code } = await params;
    const room = await getRoom(code.toUpperCase());

    if (!room) {
        return NextResponse.json({ error: "Sala no encontrada" }, { status: 404 });
    }

    if (room.started) {
        return NextResponse.json({ error: "La partida ya ha comenzado" }, { status: 400 });
    }

    if (room.players.length < 3) {
        return NextResponse.json({ error: "Mínimo 3 jugadores" }, { status: 400 });
    }

    if (room.impostorCount >= room.players.length) {
        return NextResponse.json({ error: "Demasiados impostores" }, { status: 400 });
    }

    const updatedRoom = assignRoles(room);
    await saveRoom(updatedRoom);

    return NextResponse.json({ success: true });
}