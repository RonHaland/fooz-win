"use client";

import { createContext } from "react";
import { Tournament } from "@/types/game";

export const TournamentContext = createContext<TournamentContextType>({
  tournament: null,
  setTournament: () => {},
  isAdmin: false,
  isOnline: false,
});

export type TournamentContextType = {
  tournament: Tournament | null;
  setTournament: (tournament: Tournament) => void;
  isAdmin: boolean;
  isOnline: boolean;
};

export const TournamentProvider = ({
  children,
  tournament,
  setTournament,
  isAdmin,
  isOnline,
}: {
  children: React.ReactNode;
  tournament: Tournament | null;
  setTournament: (tournament: Tournament) => void;
  isAdmin: boolean;
  isOnline: boolean;
}) => {
  return (
    <TournamentContext.Provider
      value={{ tournament, setTournament, isAdmin, isOnline }}
    >
      {children}
    </TournamentContext.Provider>
  );
};
