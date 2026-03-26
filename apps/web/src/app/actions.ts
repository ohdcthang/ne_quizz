"use server";

import prisma from "@repo/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

export async function createQuiz(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  const quiz = await prisma.quiz.create({
    data: {
      title,
      description,
    },
  });

  revalidatePath("/admin");
  return quiz;
}

export async function addQuestion(quizId: string, formData: FormData) {
  try {
    const text = formData.get("text") as string;
    const imageFile = formData.get("imageUrl") as File;
    let imageUrl = null;

    if (imageFile && imageFile.name && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create a unique filename
      const filename = `${Date.now()}-${imageFile.name.replaceAll(" ", "_")}`;
      
      // Try multiple path strategies for monorepo robustness
      let uploadDir = join(process.cwd(), "apps/web/public/uploads");
      // Fallback if we are already in apps/web
      if (process.cwd().endsWith("apps/web")) {
        uploadDir = join(process.cwd(), "public/uploads");
      }

      const path = join(uploadDir, filename);
      await writeFile(path, buffer);
      imageUrl = `/uploads/${filename}`;
    } else {
      // Fallback to text if it's a string (backwards compatibility)
      const possibleUrl = formData.get("imageUrl");
      if (typeof possibleUrl === "string" && possibleUrl.startsWith("http")) {
        imageUrl = possibleUrl;
      }
    }

    const timeLimit = parseInt(formData.get("timeLimit") as string) || 20;
    const points = parseInt(formData.get("points") as string) || 1000;
    
    const optionsData = [];
    for (let i = 0; i < 4; i++) {
      const optionText = formData.get(`option-${i}`) as string;
      const isCorrect = formData.get(`correct-${i}`) === "on";
      if (optionText) {
        optionsData.push({ text: optionText, isCorrect });
      }
    }

    await prisma.question.create({
      data: {
        text,
        imageUrl,
        type: "MULTIPLE_CHOICE",
        timeLimit,
        points,
        quizId,
        options: {
          create: optionsData,
        },
      },
    });

    revalidatePath(`/admin/quiz/${quizId}`);
    return { success: true };
  } catch (error) {
    console.error("Error adding question:", error);
    return { error: "Failed to add question", details: String(error) };
  }
}

export async function createSession(quizId: string) {
  const pin = Math.floor(100000 + Math.random() * 900000).toString();
  
  const session = await prisma.session.create({
    data: {
      pin,
      quizId,
      status: "LOBBY",
    },
  });

  redirect(`/session/${pin}/host`);
}

export async function joinSession(pin: string, name: string) {
  const session = await prisma.session.findUnique({
    where: { pin },
  });

  if (!session || (session.status !== "LOBBY" && session.status !== "PLAYING")) {
    throw new Error("Session not found or already finished");
  }

  const player = await prisma.player.create({
    data: {
      name,
      sessionId: session.id,
    },
  });

  redirect(`/session/${pin}/lobby?playerId=${player.id}`);
}

export async function startSession(sessionId: string) {
  await prisma.session.update({
    where: { id: sessionId },
    data: {
      status: "PLAYING",
      currentQuestionIndex: 0,
    },
  });

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { quiz: true },
  });

  revalidatePath(`/session/${session?.pin}/host`);
  revalidatePath(`/session/${session?.pin}/lobby`);
}

export async function submitResponse(
  playerId: string,
  questionId: string,
  optionId: string | null,
  timeTaken: number
) {
  let isCorrect = false;

  const question = await prisma.question.findUnique({ where: { id: questionId } });

  if (optionId) {
    const option = await prisma.option.findUnique({
      where: { id: optionId },
    });
    isCorrect = option?.isCorrect || false;
  }

  let score = 0;
  if (isCorrect) {
    const maxPoints = question?.points || 1000;
    const timeLimitMs = (question?.timeLimit || 20) * 1000;
    score = Math.max(0, Math.floor(maxPoints * (1 - timeTaken / timeLimitMs)));
  }

  try {
    // Check if response already exists to prevent unique constraint errors
    const existingResponse = await prisma.response.findUnique({
      where: {
        playerId_questionId: {
          playerId,
          questionId,
        },
      },
    });

    if (existingResponse) {
      // @ts-ignore
      return { isCorrect: existingResponse.isCorrect, score: existingResponse.score };
    }

    await prisma.response.create({
      data: {
        playerId,
        questionId,
        optionId: optionId || null,
        textAnswer: null,
        timeTaken,
        isCorrect,
        // @ts-ignore
        score: Math.round(score),
      },
    });

    if (isCorrect) {
      await prisma.player.update({
        where: { id: playerId },
        data: {
          score: {
            increment: Math.round(score),
          },
        },
      });
    }

    // Get session pin for revalidation
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: { session: true }
    });
    
    if (player?.session?.pin) {
      revalidatePath(`/session/${player.session.pin}/host`);
    }

    return { isCorrect, score: Math.round(score) };
  } catch (error) {
    console.error("Error in submitResponse:", error);
    return { error: "Failed to submit response", details: String(error) };
  }
}

export async function nextQuestion(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { quiz: { include: { questions: true } } },
  });

  if (!session) return;

  const nextIndex = session.currentQuestionIndex + 1;
  
  if (nextIndex >= session.quiz.questions.length) {
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        status: "FINISHED",
      },
    });
  } else {
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        currentQuestionIndex: nextIndex,
      },
    });
  }

  revalidatePath(`/session/${session.pin}/host`);
}

export async function finishSession(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) return;

  await prisma.session.update({
    where: { id: sessionId },
    data: {
      status: "FINISHED",
    },
  });

  revalidatePath(`/session/${session.pin}/host`);
}

export async function adjustPlayerScore(playerId: string, amount: number) {
  const player = await prisma.player.update({
    where: { id: playerId },
    data: {
      score: {
        increment: amount,
      },
    },
    include: {
      session: true,
    },
  });

  if (player.session.pin) {
    revalidatePath(`/session/${player.session.pin}/host`);
  }

  return player;
}
