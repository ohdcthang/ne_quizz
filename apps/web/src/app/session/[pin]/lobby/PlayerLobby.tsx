"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function PlayerLobby({ pin, playerId }: { pin: string; playerId: string }) {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/session/${pin}`, { cache: 'no-store' });
        const data = await res.json();
        setSession(data);
        
        if (data.status === "PLAYING") {
          router.push(`/session/${pin}/play?playerId=${playerId}`);
        }
      } catch (err) {
        console.error("Lobby polling error:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [pin, playerId, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-white text-center font-sans selection:bg-amber-500 selection:text-black">
      <div className="glass-card p-12 max-w-sm w-full rounded-4xl border border-white/10 glow-box-accent animate-in fade-in zoom-in duration-700">
        <h1 className="text-xs font-black uppercase tracking-[0.4em] opacity-40 mb-6 italic">Success!</h1>
        <div className="w-24 h-24 bg-amber-500 rounded-full mx-auto mb-8 shadow-[0_0_30px_rgba(245,158,11,0.3)] flex items-center justify-center animate-bounce">
            <span className="text-5xl">⚡</span>
        </div>
        <h2 className="text-4xl font-black uppercase tracking-tighter mb-2 glow-accent text-white italic">You're in!</h2>
        <div className="text-5xl font-black mt-4 text-amber-500 italic tracking-tighter glow-accent">
            Get Ready...
        </div>
        
        <div className="mt-12 flex flex-col items-center gap-4 text-xs font-black uppercase tracking-[0.3em] text-white/20">
            <div className="h-px w-12 bg-white/10" />
            <p className="">Can you see your name on the dashboard?</p>
        </div>
      </div>

      <div className="mt-16 glass-card-accent py-4 px-10 rounded-full border border-white/5 opacity-40">
         <div className="text-[10px] font-black uppercase tracking-[0.5em]">Game PIN: {pin}</div>
      </div>
    </div>
  );
}
