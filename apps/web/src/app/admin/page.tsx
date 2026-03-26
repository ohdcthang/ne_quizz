import { createQuiz, createSession } from "../actions";
import prisma from "@repo/database";
import { Quiz } from "@repo/database";
import Link from "next/link";

export default async function AdminPage() {
  const quizzes: Quiz[] = await prisma.quiz.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen p-12 font-sans selection:bg-amber-500 selection:text-black">
      <div className="mx-auto max-w-5xl">
        <header className="mb-20 flex items-center justify-between">
          <div>
            <h1 className="text-6xl font-black uppercase tracking-tighter italic glow-accent text-amber-500">
              Admin Portal
            </h1>
            <p className="mt-4 text-sm font-black uppercase tracking-[0.4em] opacity-40">
              Control the Race
            </p>
          </div>
        </header>

        <section className="glass-card mb-20 p-12 rounded-4xl border border-white/10 glow-box-accent">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-10 text-white">
            Forge New Race
          </h2>
          <form 
            action={async (formData) => {
              "use server";
              await createQuiz(formData);
            }} 
            className="space-y-8"
          >
            <div className="space-y-3">
              <label htmlFor="title" className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 ml-4">
                Quiz Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-xl font-bold placeholder:opacity-20 focus:outline-none focus:border-amber-500/50 transition-all text-white glow-box-accent"
                placeholder="e.g., General Knowledge 2024"
              />
            </div>
            <div className="space-y-3">
              <label htmlFor="description" className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 ml-4">
                Description (Optional)
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-xl font-bold placeholder:opacity-20 focus:outline-none focus:border-amber-500/50 transition-all text-white glow-box-accent"
                placeholder="What is this race about?"
              />
            </div>
            <button
              type="submit"
              className="premium-button px-16 py-6 text-2xl font-black uppercase italic rounded-full h-auto"
            >
              Build Quiz
            </button>
          </form>
        </section>

        <section>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-10 text-white opacity-40">
            Active Challenges
          </h2>
          <div className="grid gap-8 sm:grid-cols-2">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="glass-card flex flex-col p-10 rounded-4xl border border-white/10 hover:border-amber-500/30 transition-all duration-500 group"
              >
                <div className="mb-6 flex-1">
                  <h3 className="text-4xl font-black uppercase italic tracking-tighter text-white group-hover:text-amber-500 transition-colors duration-500">
                    {quiz.title}
                  </h3>
                  <p className="mt-4 text-sm font-bold opacity-30 line-clamp-2">
                    {quiz.description || "No description provided."}
                  </p>
                </div>
                <div className="mt-10 flex items-center gap-6">
                  <Link
                    href={`/admin/quiz/${quiz.id}`}
                    className="text-xs font-black uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors no-underline"
                  >
                    Edit
                  </Link>
                  <div className="h-4 w-px bg-white/10" />
                  <form action={async () => {
                    "use server";
                    await createSession(quiz.id);
                  }} className="inline">
                    <button
                      type="submit"
                      className="text-xs font-black uppercase tracking-[0.3em] text-amber-500 hover:text-amber-400 glow-accent italic transition-colors"
                    >
                      Host Race!
                    </button>
                  </form>
                </div>
              </div>
            ))}
            {quizzes.length === 0 && (
              <div className="col-span-full rounded-4xl border-2 border-dashed border-white/5 py-24 text-center">
                <p className="text-sm font-black uppercase tracking-[0.4em] opacity-20">
                  No active races. Create your first one above!
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
