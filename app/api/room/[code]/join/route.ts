import { NextResponse } from "next/server";
import { getRoom, saveRoom } from "@/lib/redis";
import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    // Rate limit: máximo 20 joins por IP por hora
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rateLimitKey = `ratelimit:join:${ip}`;
    const current = await redis.incr(rateLimitKey);

    if (current === 1) {
        await redis.expire(rateLimitKey, 3600);
    }

    if (current > 20) {
        return NextResponse.json(
            { error: "Demasiadas peticiones. Espera un rato." },
            { status: 429 }
        );
    }

    const { code } = await params;
    const body = await request.json();
    const { name } = body as { name: string };

    if (!name || name.trim().length === 0) {
        return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    }

    if (name.trim().length > 20) {
        return NextResponse.json({ error: "Nombre demasiado largo" }, { status: 400 });
    }

    const room = await getRoom(code.toUpperCase());

    if (!room) {
        return NextResponse.json({ error: "Sala no encontrada" }, { status: 404 });
    }

    if (room.started) {
        return NextResponse.json({ error: "La partida ya ha comenzado" }, { status: 400 });
    }

    if (room.players.length >= 30) {
        return NextResponse.json({ error: "Sala llena" }, { status: 400 });
    }

    const playerId = crypto.randomUUID();

    room.players.push({
        id: playerId,
        name: name.trim(),
    });

    await saveRoom(room);

    return NextResponse.json({ playerId });
}