import prisma from "@repo/database";
import { createSession } from "../../../actions";
import QuestionForm from "./QuestionForm";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function QuizDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: {
        include: {
          options: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!quiz) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mb-2">
              <Link href="/admin" className="hover:underline">Dashboard</Link>
              <span>/</span>
              <span>Quiz Details</span>
            </div>
            <h1 className="text-5xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter">
              {quiz.title}
            </h1>
            {quiz.description && (
              <p className="mt-4 text-xl text-zinc-500 dark:text-zinc-400 font-medium max-w-2xl leading-relaxed">
                {quiz.description}
              </p>
            )}
          </div>
          <div className="flex gap-4">
             <form action={async () => {
                "use server";
                await createSession(quiz.id);
             }}>
                <button
                   type="submit"
                   className="rounded-full bg-indigo-600 px-8 py-4 text-lg font-black text-white shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95"
                >
                   Host This Quiz
                </button>
             </form>
          </div>
        </header>

        <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
          <section>
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
                Questions
                <span className="rounded-full bg-zinc-200 px-3 py-1 text-sm font-bold dark:bg-zinc-800">
                  {quiz.questions.length}
                </span>
              </h2>
            </div>

            <div className="space-y-6">
              {quiz.questions.map((question: any, index: number) => (
                <div
                  key={question.id}
                  className="group relative rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:border-indigo-200 dark:border-zinc-800 dark:bg-zinc-900 group"
                >
                  <div className="absolute -left-4 top-8 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-lg font-black text-white shadow-lg dark:bg-zinc-800">
                    {index + 1}
                  </div>

                  <div className="flex-1 ml-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black text-zinc-900 group-hover:text-indigo-600 transition-colors dark:text-zinc-50 dark:group-hover:text-indigo-400 leading-tight">
                          {question.text}
                        </h3>
                        <div className="flex items-center gap-3 text-xs font-bold text-zinc-400 uppercase tracking-widest mt-2">
                          <span className="flex items-center gap-1.5 bg-zinc-100 px-3 py-1 rounded-full dark:bg-zinc-800">
                             ⏱ {question.timeLimit}s
                          </span>
                          <span className="flex items-center gap-1.5 bg-zinc-100 px-3 py-1 rounded-full dark:bg-zinc-800">
                             💎 {question.points} pts
                          </span>
                        </div>
                      </div>
                    </div>

                    {(question as any).imageUrl && (
                      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 max-w-md shadow-inner bg-zinc-50 dark:bg-zinc-950">
                        <img 
                          src={(question as any).imageUrl} 
                          alt="Question" 
                          className="w-full h-auto object-contain max-h-64 mx-auto"
                        />
                      </div>
                    )}

                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                      {question.options.map((option: any) => (
                        <div
                          key={option.id}
                          className={`flex items-center justify-between rounded-xl border-2 p-4 text-base font-bold transition-all ${
                            option.isCorrect
                              ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400"
                              : "border-zinc-100 bg-zinc-50/50 text-zinc-500 dark:border-zinc-800/50 dark:bg-zinc-900/50 dark:text-zinc-500"
                          }`}
                        >
                          <span className="truncate">{option.text}</span>
                          {option.isCorrect && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shrink-0">
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {quiz.questions.length === 0 && (
                <div className="rounded-3xl border-4 border-dashed border-zinc-200 py-20 text-center dark:border-zinc-800">
                  <div className="text-6xl mb-4 opacity-20">📝</div>
                  <p className="text-xl font-bold text-zinc-400">
                    No questions added yet.
                  </p>
                  <p className="text-zinc-500 mt-2">Use the form on the right to start building!</p>
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="sticky top-8">
               <QuestionForm quizId={id} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
