"use client";

import { useTransition, useRef } from "react";
import { addQuestion } from "../../../actions";

interface QuestionFormProps {
  quizId: string;
}

export default function QuestionForm({ quizId }: QuestionFormProps) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await addQuestion(quizId, formData);
      if (result && "error" in result) {
        alert(`Error: ${result.error}\n${result.details || ""}`);
      } else {
        formRef.current?.reset();
      }
    });
  };

  return (
    <div className="sticky top-8 rounded-2xl bg-white p-6 shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
      <h2 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Add Question
      </h2>
      <form
        ref={formRef}
        action={handleSubmit}
        className="space-y-6"
      >
        <input type="hidden" name="type" value="MULTIPLE_CHOICE" />

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Question Text
          </label>
          <input
            type="text"
            name="text"
            required
            placeholder="Ex: What is the capital of France?"
            className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Upload Image (Optional)
          </label>
          <input
            type="file"
            name="imageUrl"
            accept="image/*"
            className="mt-1 block w-full text-sm text-zinc-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100
              dark:file:bg-zinc-800 dark:file:text-zinc-300 transition-all"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Time Limit (s)
            </label>
            <input
              type="number"
              name="timeLimit"
              defaultValue={20}
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Points
            </label>
            <input
              type="number"
              name="points"
              defaultValue={1000}
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="space-y-4">
          <span className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Options (Check the correct one)
          </span>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="checkbox"
                name={`correct-${i}`}
                className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 transition-all"
              />
              <input
                type="text"
                name={`option-${i}`}
                required={i < 2}
                placeholder={i < 2 ? "Required option" : "Optional option"}
                className="block w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Adding..." : "Add Question"}
        </button>
      </form>
    </div>
  );
}
