"use client";

import { useEffect, useState, useTransition } from "react";
import { startSession, finishSession, adjustPlayerScore } from "../../../actions";
// @ts-ignore
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

export function HostGame({ pin, initialSession }: { pin: string; initialSession: any }) {
  const [session, setSession] = useState(initialSession);
  const [isPending, startTransition] = useTransition();
  const [showReport, setShowReport] = useState(false);
  const [adjustmentStep, setAdjustmentStep] = useState(50);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/session/${pin}`, { cache: 'no-store' });
      const data = await res.json();
      setSession(data);
    }, 2000);

    return () => clearInterval(interval);
  }, [pin]);

  const handleEnd = () => {
    startTransition(async () => {
      await finishSession(session.id);
    });
  };

  const handleStart = () => {
    startTransition(async () => {
      await startSession(session.id);
    });
  };

  return (
    <div className="min-h-screen p-12 font-sans selection:bg-amber-500 selection:text-black bg-black text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-20 flex items-center justify-between">
          <div className="flex flex-col gap-3">
            <h1 className="text-6xl font-black uppercase tracking-tighter italic leading-none glow-accent text-white">
              {session.quiz.title}
            </h1>
            <div className="mt-2 text-2xl font-black text-amber-500 uppercase tracking-[0.4em] italic opacity-40">
              JOIN AT NEQUIZZ.IO
            </div>
          </div>
          <div className="flex gap-8 items-start">
            <div className="glass-card p-4 rounded-3xl bg-white/5 border-white/10">
              <QRCodeSVG 
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/session/${session.pin}/join`}
                size={160}
                className="rounded-xl opacity-90"
              />
            </div>
            <div className="glass-card-accent p-10 rounded-3xl text-amber-500 text-center min-w-[240px]">
              <span className="text-xs font-black uppercase tracking-[0.5em] opacity-40 mb-2 block text-white/40">Game PIN</span>
              <div className="text-8xl font-black tracking-tighter italic glow-accent">
                {session.pin}
              </div>
            </div>
          </div>
        </header>

        <main>
          {session.status === "LOBBY" ? (
             <div className="animate-in fade-in duration-1000">
               <div className="flex justify-between items-end mb-16 px-4">
                  <h2 className="text-9xl font-black uppercase italic tracking-tighter opacity-10 leading-none">Lobby</h2>
                  <div className="flex flex-col items-end gap-2 text-right">
                     <div className="text-xs font-black uppercase tracking-[0.5em] opacity-40">Connected Players</div>
                     <div className="text-6xl font-black italic text-amber-500 glow-accent">
                        {session.players.length}
                     </div>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                {session.players.map((player: any) => (
                  <div
                    key={player.id}
                    className="animate-in fade-in zoom-in glass-card p-8 text-2xl font-black uppercase italic text-center hover:bg-white/10 hover:border-white/20 transition-all rounded-3xl border border-white/10"
                  >
                    {player.name}
                  </div>
                ))}
               </div>

               <div className="mt-32 text-center pb-20">
                <button 
                    onClick={handleStart}
                    disabled={isPending}
                    className="premium-button px-24 py-8 text-5xl font-black uppercase italic rounded-full h-auto"
                >
                    {isPending ? "Starting..." : "Start Race!"}
                </button>
               </div>
            </div>
          ) : session.status === "PLAYING" ? (
            <div className="text-center py-4 animate-in fade-in duration-700">
               <div className="flex justify-between items-end mb-20 px-4 relative">
                  <h2 className="text-[14rem] font-black uppercase italic tracking-tighter opacity-10 absolute -top-20 -left-10 z-0 leading-none text-white/10">The Race</h2>
                  <div className="relative z-10 text-left">
                     <h2 className="text-8xl font-black uppercase italic tracking-tighter glow-accent text-amber-500">The Race!</h2>
                  </div>
                  <div className="text-2xl font-black uppercase tracking-[0.3em] bg-white/5 border border-white/10 px-8 py-4 rounded-full backdrop-blur-md relative z-10 transition-all hover:border-amber-500/30">
                     {session.players.length} Racing
                  </div>
               </div>

               <div className="space-y-12 relative z-10">
                  {([...(session.players || [])])
                    .sort((a: any, b: any) => {
                       if ((b.responses?.length || 0) !== (a.responses?.length || 0)) {
                         return (b.responses?.length || 0) - (a.responses?.length || 0);
                       }
                       return (b.score || 0) - (a.score || 0);
                    })
                    .map((player: any, index: number) => {
                       const progress = ((player.responses?.length || 0) / session.quiz.questions.length) * 100;
                       const finished = (player.responses?.length || 0) === session.quiz.questions.length;
                       
                       return (
                          <div
                            key={player.id}
                            className={`glass-card p-10 transition-all duration-700 rounded-4xl group ${
                               finished ? "border-amber-500/50 bg-amber-500/5 glow-box-accent" : ""
                            }`}
                          >
                             <div className="relative flex items-center justify-between gap-16">
                                <div className="flex items-center gap-12 flex-1">
                                   <div className={`flex h-20 w-20 items-center justify-center text-5xl font-black italic rounded-3xl transition-all duration-500 ${
                                      index === 0 ? "bg-amber-500 text-black glow-box-accent translate-x-1" : "bg-white/5 text-white/20 border border-white/10"
                                   }`}>
                                      {index + 1}
                                   </div>
                                   <div className="text-left flex-1">
                                      <div className="text-5xl font-black flex items-center gap-8 italic tracking-tighter mb-4">
                                         <span className="text-white group-hover:text-amber-500 transition-colors duration-500">{player.name}</span>
                                         {finished && (
                                            <span className="text-xs bg-amber-500 text-black px-4 py-2 rounded-full uppercase italic font-black shadow-lg animate-bounce">
                                               Finished!
                                            </span>
                                         )}
                                      </div>
                                      
                                      <div className="mt-8 max-w-2xl">
                                         <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.4em] mb-4 italic opacity-40">
                                            <span>Current Question: {Math.min((player.responses?.length || 0) + 1, session.quiz.questions.length)}</span>
                                            <span>{Math.round(progress)}% Complete</span>
                                         </div>
                                         <div className="h-4 w-full bg-white/5 rounded-full border border-white/10 overflow-hidden relative p-1 shadow-inner">
                                            <div 
                                               className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
                                                  finished ? "bg-amber-500 glow-box-accent" : "bg-white/40 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                                               }`}
                                               style={{ width: `${progress}%` }}
                                            />
                                         </div>
                                      </div>
                                   </div>
                                </div>

                                <div className="flex items-center gap-16 min-w-[240px] justify-end text-right">
                                   <div className="text-right">
                                      <div className="text-7xl font-black tracking-tighter italic glow-accent leading-none mb-2">{player.score}</div>
                                      <div className="text-xs font-black uppercase tracking-[0.3em] opacity-30 italic">Total Score</div>
                                   </div>
                                </div>
                             </div>
                          </div>
                       );
                    })}
               </div>

               <div className="mt-32 text-center pb-20 relative z-10">
                  <button 
                    onClick={handleEnd}
                    disabled={isPending}
                    className="premium-outline-button px-16 py-6 text-2xl font-black uppercase italic rounded-full h-auto"
                  >
                    {isPending ? "Ending..." : "Close Race Now"}
                  </button>
               </div>
            </div>
          ) : (
            <div className="text-center py-20 animate-in zoom-in duration-1000 selection:bg-black selection:text-amber-500 relative">
               <h2 className="text-[16rem] font-black leading-[0.7] mb-32 uppercase italic tracking-tighter glow-accent text-amber-500 opacity-20 absolute -top-10 left-1/2 -translate-x-1/2 w-full mix-blend-overlay uppercase">WINNERS</h2>
               
               <div className="mb-12 flex items-center justify-center gap-8 animate-in fade-in slide-in-from-top duration-1000">
                  <div className="glass-card px-8 py-4 rounded-2xl border border-white/10 flex items-center gap-4">
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Adjustment Point:</span>
                     <input 
                        type="number" 
                        value={adjustmentStep}
                        onChange={(e) => setAdjustmentStep(parseInt(e.target.value) || 0)}
                        className="bg-transparent text-amber-500 font-black text-2xl w-24 outline-none border-b border-white/10 text-center pb-1"
                     />
                  </div>
               </div>

               <div className="mx-auto max-w-4xl space-y-8 relative z-10 leading-none">
                {(session.players || [])
                  .sort((a: any, b: any) => b.score - a.score)
                  .map((player: any, index: number) => {
                    const handleAdjust = (amount: number) => {
                        startTransition(async () => {
                            await adjustPlayerScore(player.id, amount);
                        });
                    };

                    return (
                        <div key={player.id} className="space-y-4">
                            <div
                            className={`glass-card flex items-center justify-between p-10 rounded-4xl transition-all duration-1000 ${
                                index === 0 ? "scale-110 bg-amber-500! text-black! border-black! glow-box-accent mt-20" : "bg-white/5 text-white"
                            }`}
                            >
                                <div className="flex items-center gap-10">
                                    <span className={index === 0 ? "text-5xl font-black italic opacity-40 text-black" : "text-5xl font-black italic opacity-20 text-white"}>#{index + 1}</span>
                                    <span className="text-6xl font-black uppercase italic tracking-tighter">{player.name}</span>
                                </div>
                                <div className="flex items-center gap-12">
                                    <div className="flex flex-col gap-2">
                                        <button 
                                            onClick={() => handleAdjust(adjustmentStep)}
                                            className={`h-12 w-12 rounded-xl border flex items-center justify-center font-black text-2xl transition-all hover:scale-110 active:scale-95 ${
                                                index === 0 ? "border-black/20 text-black hover:bg-black/10" : "border-white/10 text-white hover:bg-white/10"
                                            }`}
                                        >
                                            +
                                        </button>
                                        <button 
                                            onClick={() => handleAdjust(-adjustmentStep)}
                                            className={`h-12 w-12 rounded-xl border flex items-center justify-center font-black text-2xl transition-all hover:scale-110 active:scale-95 ${
                                                index === 0 ? "border-black/20 text-black hover:bg-black/10" : "border-white/10 text-white hover:bg-white/10"
                                            }`}
                                        >
                                            -
                                        </button>
                                    </div>
                                    <span className="text-7xl font-black italic glow-accent">{player.score}</span>
                                </div>
                            </div>

                            {showReport && (
                                <div className="animate-in slide-in-from-top duration-500 space-y-2 px-10 border-l border-white/10 ml-10">
                                    {session.quiz.questions.map((q: any) => {
                                        const resp = player.responses.find((r: any) => r.questionId === q.id);
                                        return (
                                            <div key={q.id} className="flex justify-between items-center text-sm bg-white/5 border border-white/10 p-4 rounded-xl">
                                                <div className="text-left">
                                                    <div className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-1">{q.text}</div>
                                                    <div className={resp?.isCorrect ? "text-emerald-400 font-bold" : "text-red-400 font-bold opacity-60"}>
                                                        {resp?.isCorrect ? "Correct" : "Incorrect"}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-black italic">+{resp?.score || 0}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                  })}
               </div>

               <div className="mt-48 flex items-center justify-center gap-8 relative z-10">
                  <button 
                    onClick={() => setShowReport(!showReport)}
                    className="premium-outline-button px-16 py-8 text-3xl font-black uppercase italic rounded-full h-auto"
                  >
                    {showReport ? "Hide Report" : "Full Report"}
                  </button>
                  <Link href="/admin" className="premium-button px-24 py-8 text-3xl font-black uppercase italic no-underline rounded-full h-auto inline-block">
                    Back to Center
                  </Link>
               </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
