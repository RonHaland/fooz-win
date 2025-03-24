import { useState } from "react";
import { getTournament, saveTournament } from "@/utils/storage";
import { useEffect } from "react";
import { getPublishedTournament, publishTournament } from "@/app/actions";
import { Tournament } from "@/types/game";
import { useRouter } from "next/navigation";

export function useTournament(id: string) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const router = useRouter();

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
      }
      setTournament(loadedTournament);
    };
    loadTournament();
  }, [id, router]);

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

  return { tournament, isOnline, setTournament };
}
