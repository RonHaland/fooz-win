import { useState } from "react";
import { getTournament, saveTournament } from "@/utils/storage";
import { useEffect } from "react";
import { getPublishedTournament, publishTournament } from "@/app/actions";
import { Tournament } from "@/types/game";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function useTournament(id: string) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    const loadTournament = async () => {
      let loadedTournament = getTournament(id);
      if (!loadedTournament || loadedTournament.isActive) {
        const publishedTournament = await getPublishedTournament(id);
        if (!publishedTournament && loadedTournament) {
          loadedTournament = {
            ...loadedTournament,
            isActive: false,
          };
          saveTournament(loadedTournament);
          setTournament(loadedTournament);
          setIsOnline(false);
          return;
        }
        setIsOnline(true);
        setTournament(publishedTournament);
        setIsAdmin(
          (publishedTournament?.ownerId === session.data?.user?.id ||
            publishedTournament?.admins.some(
              (admin) => admin.id === session.data?.user?.id
            )) ??
            false
        );
        return;
      }
      setIsAdmin(true);
      setTournament(loadedTournament);
    };
    loadTournament();
  }, [id, router, session.data?.user?.id]);

  async function saveTournamentInternal(
    tournament: Tournament,
    isOnline: boolean
  ) {
    saveTournament(tournament);
    if (isOnline) {
      await publishTournament(tournament);
    }
  }

  useEffect(() => {
    async function save() {
      if (tournament) {
        await saveTournamentInternal(tournament, isOnline);
      }
    }
    save();
  }, [tournament, isOnline]);

  return { tournament, isOnline, isAdmin, setTournament };
}
