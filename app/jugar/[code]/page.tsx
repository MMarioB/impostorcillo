"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";

interface Player {
    id: string;
    name: string;
    isImpostor?: boolean;
    word?: string;
}

interface Room {
    code: string;
    category: string;
    players: Player[];
    started: boolean;
}

export default function JugarPage() {
    const params = useParams();
    const code = (params.code as string).toUpperCase();
    const [room, setRoom] = useState<Room | null>(null);
    const [playerId, setPlayerId] = useState<string | null>(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem(`player-${code}`);
        }
        return null;
    });
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [joining, setJoining] = useState(false);

    const fetchRoom = useCallback(async () => {
        const pid = localStorage.getItem(`player-${code}`);
        const url = pid ? `/api/room/${code}?playerId=${pid}` : `/api/room/${code}`;
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            setRoom(data);
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
        } else {
            const data = await res.json();
            alert(data.error);
        }
        setJoining(false);
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

    // Partida empezada - mostrar rol
    if (room.started && playerId) {
        const me = room.players.find((p) => p.id === playerId);

        if (!me) {
            return (
                <main className="min-h-screen flex items-center justify-center bg-[#1a1a2e] text-white">
                    <div className="text-center">
                        <span className="text-6xl">😵</span>
                        <p className="text-[#ff5252] text-xl mt-4 font-bold">No estás en esta partida</p>
                    </div>
                </main>
            );
        }

        if (me.isImpostor) {
            return (
                <main className="min-h-screen flex items-center justify-center bg-[#1a1a2e] p-4">
                    <div className="bg-gradient-to-b from-[#ff5252] to-[#cc4141] p-8 rounded-3xl w-full max-w-md border-4 border-[#ff5252] shadow-[0_10px_0_#991f1f] text-center">
                        <span className="text-8xl">🕵️</span>
                        <h1 className="text-4xl font-black text-white mt-6 uppercase">¡Impostor!</h1>
                        <p className="text-white/80 mt-4 text-lg">Intenta que no te descubran...</p>
                        <div className="mt-6 bg-white/20 rounded-2xl p-4">
                            <p className="text-white/60 text-sm">No sabes la palabra</p>
                            <p className="text-white font-bold">¡Finge que la conoces!</p>
                        </div>
                    </div>
                </main>
            );
        }

        return (
            <main className="min-h-screen flex items-center justify-center bg-[#1a1a2e] p-4">
                <div className="bg-gradient-to-b from-[#4fffdf] to-[#2db89e] p-8 rounded-3xl w-full max-w-md border-4 border-[#4fffdf] shadow-[0_10px_0_#1f8a75] text-center">
                    <span className="text-8xl">✅</span>
                    <h1 className="text-2xl font-black text-[#1a1a2e] mt-6 uppercase">Tu palabra es</h1>
                    <p className="text-5xl font-black text-[#1a1a2e] mt-4 uppercase">{me.word}</p>
                    <div className="mt-6 bg-black/20 rounded-2xl p-4">
                        <p className="text-[#1a1a2e]/80 font-bold">¡Encuentra al impostor!</p>
                    </div>
                </div>
            </main>
        );
    }

    // No se ha unido todavía
    if (!playerId) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-[#1a1a2e] p-4">
                <div className="bg-[#16213e] p-8 rounded-3xl w-full max-w-md border-4 border-[#0f3460] shadow-[0_10px_0_#0f3460]">
                    <div className="text-center mb-6">
                        <span className="text-5xl">👋</span>
                        <h1 className="text-3xl font-black text-white mt-2">UNIRSE</h1>
                        <p className="text-[#4fffdf] mt-1 font-medium">Sala: {code}</p>
                    </div>

                    <div className="mb-6">
                        <label className="block mb-2 font-bold text-[#ffe66d] text-sm uppercase tracking-wide">
                            Tu nombre
                        </label>
                        <input
                            type="text"
                            placeholder="¿Cómo te llamas?"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-4 rounded-2xl bg-[#0f3460] border-2 border-[#4fffdf] text-white font-medium text-lg focus:outline-none focus:border-[#ffe66d] transition-colors placeholder:text-gray-500"
                        />
                    </div>

                    <button
                        onClick={joinRoom}
                        disabled={joining || !name.trim()}
                        className="w-full p-5 bg-[#4fffdf] hover:bg-[#3de0c5] text-[#1a1a2e] rounded-2xl font-black text-xl uppercase tracking-wide shadow-[0_6px_0_#2db89e] hover:shadow-[0_4px_0_#2db89e] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                        {joining ? "Uniéndose..." : "🎮 Entrar"}
                    </button>
                </div>
            </main>
        );
    }

    // Esperando que empiece
    return (
        <main className="min-h-screen flex items-center justify-center bg-[#1a1a2e] p-4">
            <div className="bg-[#16213e] p-8 rounded-3xl w-full max-w-md border-4 border-[#0f3460] shadow-[0_10px_0_#0f3460] text-center">
                <span className="text-6xl animate-bounce">⏳</span>
                <h1 className="text-2xl font-black text-white mt-4">SALA {code}</h1>
                <p className="text-[#ffe66d] mt-2 font-medium">Esperando a que empiece...</p>

                <div className="mt-6 bg-[#0f3460] rounded-2xl p-4">
                    <p className="text-[#4fffdf] font-bold mb-3">Jugadores ({room.players.length})</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {room.players.map((player, i) => (
                            <span
                                key={player.id}
                                className="px-4 py-2 rounded-full font-bold text-sm"
                                style={{
                                    backgroundColor: ["#ff5252", "#4fffdf", "#ffe66d", "#a29bfe", "#fd79a8"][i % 5],
                                    color: "#1a1a2e",
                                }}
                            >
                                {player.name} {player.id === playerId && "👈"}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}