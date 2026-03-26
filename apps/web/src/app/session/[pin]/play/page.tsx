import { PlayerGame } from "./PlayerGame";
import prisma from "@repo/database";
import { notFound } from "next/navigation";

export default async function PlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ pin: string }>;
  searchParams: Promise<{ playerId: string }>;
}) {
  const { pin } = await params;
  const { playerId } = await searchParams;

  const session = await prisma.session.findUnique({
    where: { pin },
    include: {
      quiz: {
        include: {
          questions: {
            include: { options: true },
          },
        },
      },
    },
  });

  if (!session) {
    notFound();
  }

  const player = await prisma.player.findUnique({
    where: { id: playerId },
  });

  if (!player) {
    notFound();
  }

  return <PlayerGame pin={pin} player={player} initialSession={session} />;
}
