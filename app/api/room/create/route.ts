import { NextResponse } from "next/server";
import { generateRoomCode, Room } from "@/lib/game-logic";
import { saveRoom, getRoom } from "@/lib/redis";
import { Category } from "@/lib/words";
import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(request: Request) {
    // Rate limit: máximo 10 salas por IP por hora
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rateLimitKey = `ratelimit:create:${ip}`;
    const current = await redis.incr(rateLimitKey);

    if (current === 1) {
        await redis.expire(rateLimitKey, 3600); // 1 hora
    }

    if (current > 10) {
        return NextResponse.json(
            { error: "Demasiadas salas creadas. Espera un rato." },
            { status: 429 }
        );
    }

    const body = await request.json();
    const { category, impostorCount } = body as {
        category: Category;
        impostorCount: number;
    };

    // Validar impostorCount
    if (impostorCount < 1 || impostorCount > 3) {
        return NextResponse.json(
            { error: "Número de impostores inválido" },
            { status: 400 }
        );
    }

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