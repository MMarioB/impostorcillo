"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";

const categoryOptions = [
    { value: "animales", label: "🐾 Animales" },
    { value: "peliculas", label: "🎬 Películas" },
    { value: "comida", label: "🍕 Comida" },
    { value: "profesiones", label: "👷 Profesiones" },
    { value: "lugares", label: "📍 Lugares" },
    { value: "deportes", label: "⚽ Deportes" },
    { value: "objetos", label: "📦 Objetos" },
];

interface Player {
    id: string;
    name: string;
    isImpostor?: boolean;
    word?: string;
}

interface Room {
    code: string;
    category: string;
    impostorCount: number;
    players: Player[];
    started: boolean;
    word?: string;
}

export default function SalaPage() {
    const params = useParams();
    const code = (params.code as string).toUpperCase();
    const [room, setRoom] = useState<Room | null>(null);
    const [error, setError] = useState("");
    const [starting, setStarting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [name, setName] = useState("");
    const [joining, setJoining] = useState(false);
    const [newCategory, setNewCategory] = useState<string | null>(null);
    const [playerId, setPlayerId] = useState<string | null>(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem(`player-${code}`);
        }
        return null;
    });

    const fetchRoom = useCallback(async () => {
        const pid = localStorage.getItem(`player-${code}`);
        const url = pid ? `/api/room/${code}?playerId=${pid}` : `/api/room/${code}`;
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            setRoom(data);
            if (!data.started) {
                setStarting(false);
            }
        } else {
            setError("Sala no encontrada");
        }
    }, [code]);

    useEffect(() => {
        let mounted = true;

        const init = async () => {
            const pid = localStorage.getItem(`player-${code}`);
            const url = pid ? `/api/room/${code}?playerId=${pid}` : `/api/room/${code}`;
            const res = await fetch(url);
            if (!mounted) return;
            if (res.ok) {
                const data = await res.json();
                setRoom(data);
                if (!data.started) {
                    setStarting(false);
                }
            } else {
                setError("Sala no encontrada");
            }
        };

        init();

        const interval = setInterval(fetchRoom, 2000);
        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [code, fetchRoom]);

    const joinRoom = async () => {
        if (!name.trim()) return;
        setJoining(true);

        const res = await fetch(`/api/room/${code}/join`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: name.trim() }),
        });

        if (res.ok) {
            const data = await res.json();
            setPlayerId(data.playerId);
            localStorage.setItem(`player-${code}`, data.playerId);
            fetchRoom();
        } else {
            const data = await res.json();
            alert(data.error);
        }
        setJoining(false);
    };

    const startGame = async () => {
        setStarting(true);
        const res = await fetch(`/api/room/${code}/start`, { method: "POST" });
        if (!res.ok) {
            const data = await res.json();
            alert(data.error);
            setStarting(false);
        }
    };

    const copyLink = () => {
        const shareLink = `${window.location.origin}/jugar/${code}`;
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (error) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-[#1a1a2e] text-white">
                <div className="text-center">
                    <span className="text-6xl">😵</span>
                    <p className="text-[#ff5252] text-xl mt-4 font-bold">{error}</p>
                </div>
            </main>
        );
    }

    if (!room) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-[#1a1a2e] text-white">
                <div className="text-center">
                    <span className="text-6xl animate-bounce">🕵️</span>
                    <p className="text-[#4fffdf] mt-4 font-medium">Cargando...</p>
                </div>
            </main>
        );
    }

    if (room.started) {
        const me = playerId ? room.players.find((p) => p.id === playerId) : null;

        const resetGame = async () => {
            const categoryToUse = newCategory || room.category;
            const res = await fetch(`/api/room/${code}/reset`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ category: categoryToUse }),
            });
            if (!res.ok) {
                const data = await res.json();
                alert(data.error);
            }
            setNewCategory(null);
        };

        return (
            <main className="min-h-screen flex items-center justify-center bg-[#1a1a2e] p-4">
                <div className="bg-[#16213e] p-8 rounded-3xl w-full max-w-md border-4 border-[#0f3460] shadow-[0_10px_0_#0f3460] text-center">
                    {me ? (
                        me.isImpostor ? (
                            <>
                                <span className="text-8xl">🕵️</span>
                                <h1 className="text-4xl font-black text-[#ff5252] mt-6 uppercase">¡Impostor!</h1>
                                <p className="text-gray-400 mt-4 text-lg">Intenta que no te descubran...</p>
                            </>
                        ) : (
                            <>
                                <span className="text-8xl">✅</span>
                                <h1 className="text-2xl font-black text-white mt-6 uppercase">Tu palabra es</h1>
                                <p className="text-5xl font-black text-[#4fffdf] mt-4 uppercase">{me.word}</p>
                            </>
                        )
                    ) : (
                        <>
                            <span className="text-6xl">🎮</span>
                            <h1 className="text-2xl font-black text-white mt-4">¡Partida en curso!</h1>
                            <p className="text-gray-400 mt-4 mb-2">La palabra era:</p>
                            <p className="text-5xl font-black text-[#4fffdf] uppercase">{room.word}</p>
                        </>
                    )}

                    <div className="mt-8 text-left">
                        <label className="block mb-2 font-bold text-[#ffe66d] text-sm uppercase tracking-wide">
                            Categoría siguiente
                        </label>
                        <select
                            value={newCategory || room.category}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="w-full p-4 rounded-2xl bg-[#0f3460] border-2 border-[#4fffdf] text-white font-medium text-lg focus:outline-none focus:border-[#ffe66d] transition-colors"
                        >
                            {categoryOptions.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={resetGame}
                        className="w-full mt-4 p-5 bg-[#ffe66d] hover:bg-[#ffd93d] text-[#1a1a2e] rounded-2xl font-black text-xl uppercase tracking-wide shadow-[0_6px_0_#ccb800] hover:shadow-[0_4px_0_#ccb800] hover:translate-y-[2px] transition-all"
                    >
                        🔄 Nueva Partida
                    </button>
                </div>
            </main>
        );
    }

    const shareLink = `${typeof window !== "undefined" ? window.location.origin : ""}/jugar/${code}`;

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#1a1a2e] p-4">
            <div className="bg-[#16213e] p-8 rounded-3xl w-full max-w-md border-4 border-[#0f3460] shadow-[0_10px_0_#0f3460]">
                <div className="text-center mb-6">
                    <span className="text-5xl">🎯</span>
                    <h1 className="text-3xl font-black text-white mt-2">SALA {code}</h1>
                    <p className="text-[#4fffdf] mt-1 font-medium">
                        {room.category} · {room.impostorCount} impostor{room.impostorCount > 1 ? "es" : ""}
                    </p>
                </div>

                {!playerId && (
                    <div className="mb-6 p-4 bg-[#0f3460] rounded-2xl border-2 border-[#ffe66d]">
                        <label className="block mb-2 font-bold text-[#ffe66d] text-sm uppercase tracking-wide">
                            Únete tú también
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Tu nombre"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="flex-1 p-3 rounded-xl bg-[#16213e] border-2 border-[#4fffdf] text-white font-medium focus:outline-none focus:border-[#ffe66d] transition-colors placeholder:text-gray-500"
                            />
                            <button
                                onClick={joinRoom}
                                disabled={joining || !name.trim()}
                                className="px-4 py-3 bg-[#4fffdf] text-[#1a1a2e] rounded-xl font-bold hover:bg-[#3de0c5] transition-colors disabled:opacity-50"
                            >
                                {joining ? "..." : "Unirme"}
                            </button>
                        </div>
                    </div>
                )}

                {playerId && (
                    <div className="mb-6 p-4 bg-[#0f3460] rounded-2xl border-2 border-[#4fffdf]">
                        <p className="text-[#4fffdf] font-bold text-center">✓ Ya estás dentro</p>
                    </div>
                )}

                <div className="mb-6">
                    <label className="block mb-2 font-bold text-[#ffe66d] text-sm uppercase tracking-wide">
                        Comparte este link
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={shareLink}
                            readOnly
                            className="flex-1 p-3 rounded-xl bg-[#0f3460] border-2 border-[#0f3460] text-white text-sm font-mono"
                        />
                        <button
                            onClick={copyLink}
                            className="px-4 py-3 bg-[#4fffdf] text-[#1a1a2e] rounded-xl font-bold hover:bg-[#3de0c5] transition-colors"
                        >
                            {copied ? "✓" : "📋"}
                        </button>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block mb-2 font-bold text-[#ffe66d] text-sm uppercase tracking-wide">
                        Jugadores ({room.players.length})
                    </label>
                    <div className="bg-[#0f3460] rounded-2xl p-4 min-h-32 border-2 border-[#0f3460]">
                        {room.players.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">Esperando jugadores...</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {room.players.map((player, i) => (
                                    <span
                                        key={player.id}
                                        className="px-4 py-2 rounded-full font-bold text-sm"
                                        style={{
                                            backgroundColor: ["#ff5252", "#4fffdf", "#ffe66d", "#a29bfe", "#fd79a8"][i % 5],
                                            color: "#1a1a2e",
                                        }}
                                    >
                                        {player.name} {player.id === playerId && "👑"}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <button
                    onClick={startGame}
                    disabled={starting || room.players.length < 3}
                    className="w-full p-5 bg-[#ff5252] hover:bg-[#ff3838] text-white rounded-2xl font-black text-xl uppercase tracking-wide shadow-[0_6px_0_#cc4141] hover:shadow-[0_4px_0_#cc4141] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[0_6px_0_#cc4141]"
                >
                    {starting ? "Iniciando..." : "🚀 Empezar Partida"}
                </button>

                {room.players.length < 3 && (
                    <p className="text-center text-gray-500 mt-4 text-sm">
                        Mínimo 3 jugadores para empezar
                    </p>
                )}
            </div>
        </main>
    );
}