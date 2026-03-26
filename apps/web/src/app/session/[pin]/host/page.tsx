import prisma from "@repo/database";
import { notFound } from "next/navigation";
import { HostGame } from "./HostGame";

export default async function HostPage({
  params,
}: {
  params: Promise<{ pin: string }>;
}) {
  const { pin } = await params;
  
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
      players: true,
    },
  });

  if (!session) {
    notFound();
  }

  return <HostGame pin={pin} initialSession={session} />;
}
