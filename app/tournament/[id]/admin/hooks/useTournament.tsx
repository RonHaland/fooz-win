import { useCallback, useState } from "react";
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
        if (!loadedTournament && !publishedTournament) {
          router.replace("/");
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
    console.log("saving tournament", tournament);
    saveTournament(tournament);
    if (isOnline) {
      await publishTournament(tournament);
    }
  }

  const setTournamentInternal = useCallback(
    (tournament: Tournament) => {
      setTournament(tournament);
      saveTournamentInternal(tournament, isOnline);
    },
    [isOnline]
  );

  return {
    tournament,
    isOnline,
    isAdmin,
    setTournament: setTournamentInternal,
  };
}
