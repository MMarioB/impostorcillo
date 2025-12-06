import { Redis } from "@upstash/redis";
import { Room } from "./game-logic";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ROOM_TTL = 3600; // 1 hora

export async function saveRoom(room: Room): Promise<void> {
    await redis.set(`room:${room.code}`, JSON.stringify(room), { ex: ROOM_TTL });
}

export async function getRoom(code: string): Promise<Room | null> {
    const data = await redis.get(`room:${code}`);
    if (!data) return null;
    return typeof data === "string" ? JSON.parse(data) : data as Room;
}

export async function deleteRoom(code: string): Promise<void> {
    await redis.del(`room:${code}`);
}