"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { submitResponse } from "../../../actions";
import MarkdownRenderer from "../../../../components/MarkdownRenderer";

interface PlayerGameProps {
  pin: string;
  player: { id: string; name: string };
  initialSession: any;
}

export function PlayerGame({ pin, player, initialSession }: PlayerGameProps) {
  const [session, setSession] = useState(initialSession);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{ isCorrect: boolean; score: number } | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [timeLeft, setTimeLeft] = useState<number>(initialSession.quiz.questions[0]?.timeLimit || 20);
  const [isPending, startTransition] = useTransition();
  const submittedQuestionId = useRef<string | null>(null);

  const me = session.players?.find((p: any) => p.id === player.id);
  const myProgress = me?.responses?.length || 0;

  // Simple polling for game state updates
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/session/${pin}`);
      const data = await res.json();
      if (!data || !data.players) return;
      
      const me = data.players.find((p: any) => p.id === player.id);
      const myResponseCount = me?.responses?.length || 0;
      
      const currentMe = session.players?.find((p: any) => p.id === player.id);
      const currentResponseCount = currentMe?.responses?.length || 0;

      if (myResponseCount !== currentResponseCount || data.status !== session.status) {
        if (myResponseCount !== currentResponseCount) {
          // Question answered successfully on server
          setSession(data);
          setSelectedOption(null); // ALLOW CLICKING NEXT QUESTION IMMEDIATELY
          // No timer here, feedback persists until next handleSelect
        } else {
          setSession(data);
          setSelectedOption(null);
          setLastResult(null);
        }
        
        if (data.status !== session.status) {
           setLastResult(null);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [pin, session.currentQuestionIndex, session.status]);

  // Timer: Just counts down
  useEffect(() => {
    if (session.status !== "PLAYING" || myProgress >= session.quiz.questions.length || selectedOption || timeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [session.status, myProgress, selectedOption, timeLeft > 0]);

  // Timeout Observer: Triggers submission once when timeLeft hits 0
  useEffect(() => {
    if (session.status === "PLAYING" && timeLeft === 0 && !selectedOption && !isPending) {
      const question = session.quiz.questions[myProgress];
      if (question && submittedQuestionId.current !== question.id) {
         handleSelect(null);
      }
    }
  }, [timeLeft]);

  // Reset timer on new question
  useEffect(() => {
    const question = session.quiz.questions[myProgress];
    if (question) {
      setTimeLeft(question.timeLimit || 20);
      setStartTime(Date.now());
      // Re-enable submission for new question
      if (submittedQuestionId.current !== question.id) {
         // This reset happens when myProgress changes
      }
    }
  }, [myProgress, session.currentQuestionIndex]);

  if (session.status === "LOBBY") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-white text-center font-sans selection:bg-amber-500 selection:text-black">
        <div className="glass-card p-12 max-sm w-full rounded-4xl border border-white/10 glow-box-accent">
            <div className="w-24 h-24 bg-amber-500 rounded-full mx-auto mb-8 glow-box-accent flex items-center justify-center animate-bounce">
                <span className="text-5xl">⚡</span>
            </div>
            <h1 className="text-5xl font-black uppercase tracking-tighter mb-4 glow-accent text-white">You're in!</h1>
            <div className="text-4xl font-black mb-8 text-amber-500 italic tracking-tight">
                {player.name}
            </div>
            <div className="text-xs font-black uppercase tracking-[0.4em] opacity-40 bg-white/5 py-4 rounded-xl border border-white/5">
                Ready to Race
            </div>
        </div>
        <div className="mt-16 flex items-center gap-4 text-xs font-black uppercase tracking-[0.5em] text-amber-500/30">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span>Waiting for Host</span>
        </div>
      </div>
    );
  }

  if (session.status === "FINISHED") {
    return (
      <div className="flex min-h-screen flex-col p-6 text-white font-sans selection:bg-amber-500 selection:text-black">
        <div className="mx-auto max-w-2xl w-full">
          <div className="glass-card p-12 mb-8 rounded-4xl border border-white/10 glow-box-accent text-center animate-in zoom-in duration-700">
             <h1 className="text-7xl font-black mb-6 uppercase italic glow-accent text-amber-500 line-height-1">Race over!</h1>
             <div className="text-sm font-black uppercase tracking-[0.4em] opacity-40 mb-10">Final Standings Pending</div>
             
             <div className="grid grid-cols-2 gap-8 pt-10 border-t border-white/5">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-20 mb-2">Total Score</div>
                  <div className="text-5xl font-black text-white italic glow-accent">{me?.score || 0}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-20 mb-2">Accuracy</div>
                  <div className="text-5xl font-black text-amber-500 italic glow-accent">
                    {Math.round((me?.responses?.filter((r: any) => r.isCorrect).length / session.quiz.questions.length) * 100)}%
                  </div>
                </div>
             </div>
          </div>

          <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-6 opacity-40 px-4">Detailed Report</h2>
          <div className="space-y-4 mb-20">
             {session.quiz.questions.map((question: any, idx: number) => {
                const response = me?.responses?.find((r: any) => r.questionId === question.id);
                const selectedOption = question.options.find((o: any) => o.id === response?.optionId);
                
                return (
                  <div key={question.id} className="glass-card p-8 rounded-3xl border border-white/5 group hover:border-white/20 transition-all">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2">Question {idx + 1}</div>
                        <MarkdownRenderer content={question.text} className="text-xl font-bold leading-tight mb-4 prose-p:mb-0" />
                        
                        {selectedOption ? (
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            response?.isCorrect ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                          }`}>
                            {response?.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/5 text-white/40 border border-white/10">
                            No Answer
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-2">Points</div>
                        <div className={`text-3xl font-black italic ${response?.isCorrect ? "text-white" : "text-white/20"}`}>
                          +{response?.score || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                );
             })}
          </div>
        </div>
      </div>
    );
  }

  if (myProgress >= session.quiz.questions.length) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-white text-center font-sans selection:bg-amber-500 selection:text-black">
        <div className="glass-card p-12 max-md w-full rounded-4xl border border-amber-500/30 glow-box-accent animate-in fade-in duration-700">
           <div className="w-20 h-20 bg-amber-500/10 rounded-full mx-auto mb-8 flex items-center justify-center border border-amber-500/20">
              <span className="text-4xl">🏁</span>
           </div>
           <h1 className="text-6xl font-black mb-4 uppercase italic text-amber-500 glow-accent">Finished!</h1>
           <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Great run! Look at the big screen for the final standings</p>
        </div>
      </div>
    );
  }

  const currentQuestion = session.quiz.questions[myProgress];

  const handleSelect = (optionId: string | null) => {
    if (selectedOption || submittedQuestionId.current === currentQuestion?.id) return;
    
    submittedQuestionId.current = currentQuestion.id;
    setLastResult(null);
    const timeTaken = Date.now() - startTime;
    setSelectedOption(optionId || "__TIMEOUT__");
    
    startTransition(async () => {
      const result = await submitResponse(player.id, currentQuestion.id, optionId, timeTaken);
      if ("error" in result) {
        console.error("Submission failed:", result.error);
        // Allow retry on error by resetting ref? Maybe not for now to avoid loops
        return;
      }
      setLastResult(result as { isCorrect: boolean; score: number });
      
      // Immediately refresh session data to advance to next question
      const res = await fetch(`/api/session/${pin}`);
      const data = await res.json();
      if (data && data.players) {
        setSession(data);
      }
    });
  };

  return (
    <div className="flex min-h-screen flex-col font-sans selection:bg-amber-500 selection:text-black">
      <header className="flex h-24 items-center justify-between px-8 bg-black/50 backdrop-blur-xl border-b border-white/10">
        <div className="text-3xl font-black tracking-tighter italic uppercase text-amber-500 glow-accent">NE Q!</div>
        <div className="flex items-center gap-6">
           <div className="flex flex-col items-end">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">Progress</div>
              <div className="text-lg font-black text-white">
                {myProgress + 1}<span className="opacity-20 mx-1">/</span>{session.quiz.questions.length}
              </div>
           </div>
           <div className="h-8 w-px bg-white/10" />
           <div className="flex flex-col items-center justify-center min-w-[60px]">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">Time</div>
              <div className={`text-2xl font-black italic tabular-nums ${timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-amber-500"}`}>
                {timeLeft}s
              </div>
           </div>
           <div className="h-8 w-px bg-white/10" />
           <div className="flex items-center gap-3 bg-white/5 pl-4 pr-1 py-1 rounded-full border border-white/10">
              <span className="text-sm font-black uppercase tracking-widest opacity-60">{player.name}</span>
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-black font-black">
                {player.name[0].toUpperCase()}
              </div>
           </div>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col gap-6 max-w-2xl mx-auto w-full">
        <div className="glass-card-accent p-10 rounded-4xl text-white font-black leading-tight text-center glow-accent overflow-hidden">
           <MarkdownRenderer content={currentQuestion.text} className="text-3xl" />
        </div>

        {currentQuestion.imageUrl && (
          <div className="mb-4 rounded-xl overflow-hidden border border-white/10 bg-white/5 shadow-sm">
            <img 
              src={currentQuestion.imageUrl} 
              alt="Question" 
              className="w-full h-auto object-contain max-h-48"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 flex-1">
          {currentQuestion.options.map((option: any) => (
            <button
              key={option.id}
              disabled={!!selectedOption || isPending}
              onClick={() => handleSelect(option.id)}
              className={`glass-card p-8 rounded-3xl transition-all duration-300 group ${
                selectedOption === option.id 
                  ? "bg-amber-500 scale-[0.98] glow-box-accent border-amber-400 text-black" 
                  : "opacity-100 placeholder:opacity-0"
              }`}
          >
            <div className={`font-black text-center text-xl uppercase tracking-widest transition-colors ${
              selectedOption === option.id ? "text-black" : "text-white group-hover:text-amber-500"
            }`}>
               {option.text}
            </div>
          </button>
        ))}
      </div>
    </main>

    {selectedOption && (
      <div className="fixed inset-x-0 top-6 px-8 animate-in slide-in-from-top duration-500 z-50">
         <div className={`py-3 px-6 max-w-[240px] mx-auto rounded-2xl font-black text-center uppercase tracking-widest overflow-hidden relative shadow-xl border-2 transition-all duration-300 ${
            !lastResult 
              ? "bg-white/5 border-white/10 text-white opacity-50" 
              : lastResult.isCorrect 
                ? "bg-emerald-500 border-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.2)]" 
                : "bg-red-600 border-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.2)]"
         }`}>
            <div className="relative z-10 flex flex-col gap-0">
                <span className="text-[8px] opacity-60 leading-none mb-1">
                   {!lastResult ? "Submitting..." : lastResult.isCorrect ? "Awesome!" : "Too Bad!"}
                </span>
                <span className="text-lg italic tracking-tighter leading-none">
                   {!lastResult ? "Locked" : lastResult.isCorrect ? `CORRECT +${lastResult.score}` : "INCORRECT +0"}
                </span>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
