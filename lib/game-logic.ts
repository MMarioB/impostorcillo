import { Category, getRandomWord } from "./words";

export interface Player {
    id: string;
    name: string;
    isImpostor?: boolean;
    word?: string;
}

export interface Room {
    code: string;
    category: Category;
    impostorCount: number;
    players: Player[];
    started: boolean;
    word?: string;
}

export function generateRoomCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

export function assignRoles(room: Room): Room {
    const word = getRandomWord(room.category);
    const playerCount = room.players.length;

    // Elegir índices de impostores al azar
    const impostorIndices: Set<number> = new Set();
    while (impostorIndices.size < room.impostorCount) {
        impostorIndices.add(Math.floor(Math.random() * playerCount));
    }

    // Asignar roles
    const playersWithRoles = room.players.map((player, index) => ({
        ...player,
        isImpostor: impostorIndices.has(index),
        word: impostorIndices.has(index) ? undefined : word
    }));

    return {
        ...room,
        started: true,
        word,
        players: playersWithRoles
    };
}