import { PlayerLobby } from "./PlayerLobby";

export default async function PlayerLobbyPage({
  params,
  searchParams,
}: {
  params: Promise<{ pin: string }>;
  searchParams: Promise<{ playerId: string }>;
}) {
  const { pin } = await params;
  const { playerId } = await searchParams;

  return <PlayerLobby pin={pin} playerId={playerId} />;
}
