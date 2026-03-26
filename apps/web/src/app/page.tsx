import { joinSession } from "./actions";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-white text-center font-sans selection:bg-amber-500 selection:text-black">
      <div className="glass-card p-12 max-w-md w-full rounded-4xl border border-white/10 glow-box-accent">
        <h1 className="text-7xl font-black uppercase tracking-tighter italic mb-2 glow-accent text-amber-500">
          NE Q!
        </h1>
        <p className="text-sm font-bold uppercase tracking-[0.3em] opacity-40 mb-12">
          Join the Race
        </p>

        <form
          action={async (formData) => {
            "use server";
            const pin = formData.get("pin") as string;
            const name = formData.get("name") as string;
            await joinSession(pin, name);
          }}
          className="flex flex-col gap-6"
        >
          <div className="space-y-4">
            <input
              type="text"
              name="pin"
              placeholder="GAME PIN"
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-2xl font-black placeholder:opacity-20 focus:outline-none focus:border-amber-500/50 transition-all text-center tracking-[0.2em] glow-box-accent uppercase"
            />
            <input
              type="text"
              name="name"
              placeholder="YOUR NICKNAME"
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-xl font-bold placeholder:opacity-20 focus:outline-none focus:border-amber-500/50 transition-all text-center glow-box-accent uppercase"
            />
          </div>
          
          <button
            type="submit"
            className="premium-button w-full py-6 text-2xl font-black rounded-2xl"
          >
            Enter Game
          </button>
        </form>
      </div>

      <footer className="mt-16 text-[10px] font-black uppercase tracking-[0.5em] opacity-20">
        <p>Start your own race at nequizz.io</p>
      </footer>
    </div>
  );
}
