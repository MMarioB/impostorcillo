"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [impostorCount, setImpostorCount] = useState(1);
  const [loading, setLoading] = useState(false);

  const createRoom = async () => {
    setLoading(true);
    const res = await fetch("/api/room/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ impostorCount }),
    });
    const data = await res.json();
    router.push(`/sala/${data.code}`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#1a1a2e] p-4">
      <div className="bg-[#16213e] p-8 rounded-3xl w-full max-w-md border-4 border-[#0f3460] shadow-[0_10px_0_#0f3460]">
        <div className="text-center mb-8">
          <span className="text-7xl">🕵️</span>
          <h1 className="text-4xl font-black text-white mt-4 tracking-tight">
            IMPOSTORCILLO
          </h1>
          <p className="text-[#4fffdf] mt-2 font-medium">¿Quién es el impostor?</p>
        </div>

        <div className="mb-8">
          <label className="block mb-2 font-bold text-[#ffe66d] text-sm uppercase tracking-wide">
            Impostores
          </label>
          <div className="flex gap-3">
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                onClick={() => setImpostorCount(num)}
                className={`flex-1 p-4 rounded-2xl font-black text-xl transition-all ${impostorCount === num
                    ? "bg-[#ff5252] text-white shadow-[0_4px_0_#cc4141]"
                    : "bg-[#0f3460] text-gray-400 border-2 border-[#0f3460] hover:border-[#ff5252]"
                  }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={createRoom}
          disabled={loading}
          className="w-full p-5 bg-[#4fffdf] hover:bg-[#3de0c5] text-[#1a1a2e] rounded-2xl font-black text-xl uppercase tracking-wide shadow-[0_6px_0_#2db89e] hover:shadow-[0_4px_0_#2db89e] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {loading ? "Creando..." : "🚀 Crear Sala"}
        </button>
      </div>
    </main>
  );
}