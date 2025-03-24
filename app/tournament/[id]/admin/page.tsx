"use client";

import { use, useState } from "react";
import { Tournament } from "@/types/game";
import { saveTournament } from "@/utils/storage";
import { ErrorModal } from "@/components/ErrorModal";
import {
  deleteTournament,
  findUserByEmail,
  publishTournament,
} from "@/app/actions";
import { PlayerManagementSection } from "./components/PlayerManagementSection";
import { TournamentSettingsSection } from "./components/TournamentSettingsSection";
import { AccessManagementSection } from "./components/AccessManagementSection";
import { useTournament } from "./hooks/useTournament";
import { InfoModal } from "@/components/InfoModal";
export default function TournamentAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [editingField, setEditingField] = useState<{
    type: "timer" | "overtimer" | "name";
    part?: "minutes" | "seconds";
    value: string;
  } | null>(null);
  const { id } = use(params);
  const [newUserEmail, setNewUserEmail] = useState<string>("");
  const { tournament, setTournament } = useTournament(id);

  const handleUpdateTournament = (updatedTournament: Tournament) => {
    updatedTournament.updatedAt = new Date().toISOString();
    saveTournament(updatedTournament);
    setTournament(updatedTournament);
  };

  const handleEditStart = (
    type: "timer" | "overtimer",
    part: "minutes" | "seconds"
  ) => {
    if (
      type === "overtimer" &&
      (!tournament?.config?.enableTimer || !tournament?.config?.enableOvertimer)
    )
      return;
    if (type === "timer" && !tournament?.config?.enableTimer) return;

    const duration =
      type === "timer"
        ? tournament?.config?.timerDuration ?? 300
        : tournament?.config?.overtimerDuration ?? 120;

    const value =
      part === "minutes"
        ? Math.floor(duration / 60)
            .toString()
            .padStart(2, "0")
        : (duration % 60).toString().padStart(2, "0");

    setEditingField({ type, part, value });
  };

  const handleEditComplete = () => {
    if (!editingField || !tournament) return;

    const { type, part, value } = editingField;
    const currentDuration =
      type === "timer"
        ? tournament.config?.timerDuration ?? 300
        : tournament.config?.overtimerDuration ?? 120;

    let newDuration: number;
    if (part === "minutes") {
      const minutes = parseInt(value) || 0;
      const seconds = currentDuration % 60;
      newDuration = minutes * 60 + seconds;
    } else {
      const minutes = Math.floor(currentDuration / 60);
      const seconds = Math.min(59, Math.max(0, parseInt(value) || 0));
      newDuration = minutes * 60 + seconds;
    }

    handleUpdateTournament({
      ...tournament,
      config: {
        ...tournament.config!,
        [type === "timer" ? "timerDuration" : "overtimerDuration"]: newDuration,
      },
    });

    setEditingField(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEditComplete();
    }
  };

  const handlePublish = async () => {
    if (!tournament) return;

    setIsPublishing(true);
    try {
      const result = await publishTournament(tournament);
      if (!result.success) {
        setErrorMessage(result.error || "Failed to publish tournament");
        return;
      }

      // Update local tournament state
      handleUpdateTournament({
        ...tournament,
        isActive: true,
      });

      // Show success message
      setInfoMessage("Tournament published successfully!");
      setTimeout(() => setInfoMessage(null), 3000);
    } catch {
      setErrorMessage("Failed to publish tournament");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!tournament) return;

    setIsUnpublishing(true);
    try {
      const result = await deleteTournament(tournament);
      if (!result.success) {
        setErrorMessage(result.error || "Failed to unpublish tournament");
        return;
      }

      // Update local tournament state
      handleUpdateTournament({
        ...tournament,
        isActive: false,
      });

      setInfoMessage("Tournament unpublished successfully!");
      setTimeout(() => setInfoMessage(null), 3000);
    } catch {
      setErrorMessage("Failed to unpublish tournament");
    } finally {
      setIsUnpublishing(false);
    }
  };

  const handleAddUserByEmail = async (isAdmin: boolean) => {
    if (!tournament) return;

    if (!newUserEmail.trim()) {
      setErrorMessage("Email address is required.");
      return;
    }

    try {
      const userExists = await findUserByEmail(newUserEmail);
      if (!userExists?.email?.length) {
        setErrorMessage("User not found in the database.");
        return;
      }

      if (
        tournament.users.some((u) => u.id === userExists.id) ||
        tournament.admins.some((a) => a.id === userExists.id)
      ) {
        setErrorMessage("User already added");
        return;
      }

      const newUser = {
        id: userExists.id,
        name: userExists.name,
        email: userExists.email,
      };

      const updatedTournament = {
        ...tournament,
        users: [...(tournament.users ?? []), ...(!isAdmin ? [newUser] : [])],
        admins: [...(tournament.admins ?? []), ...(isAdmin ? [newUser] : [])],
      };
      handleUpdateTournament(updatedTournament);

      setNewUserEmail("");
    } catch (error) {
      setErrorMessage("Error checking user in the database.\r\n" + error);
    }
  };
  const handleDelete = (userId: string) => {
    if (!tournament) return;

    const updatedTournament = {
      ...tournament,
      users: [...(tournament.users ?? []).filter((u) => u.id !== userId)],
      admins: [...(tournament.admins ?? []).filter((u) => u.id !== userId)],
    };
    handleUpdateTournament(updatedTournament);
  };

  if (!tournament) return null;

  return (
    <div className="space-y-8">
      <PlayerManagementSection
        tournament={tournament}
        onUpdateTournament={handleUpdateTournament}
      />

      <TournamentSettingsSection
        tournament={tournament}
        isPublishing={isPublishing}
        isUnpublishing={isUnpublishing}
        editingField={editingField}
        onUpdateTournament={handleUpdateTournament}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        onEditStart={handleEditStart}
        onEditComplete={handleEditComplete}
        onKeyDown={handleKeyDown}
        setEditingField={setEditingField}
      />

      <AccessManagementSection
        tournament={tournament}
        newUserEmail={newUserEmail}
        onAddUserByEmail={handleAddUserByEmail}
        onDeleteUser={handleDelete}
        setNewUserEmail={setNewUserEmail}
      />

      <ErrorModal
        isOpen={errorMessage !== null}
        onClose={() => setErrorMessage(null)}
        message={errorMessage || ""}
      />
      <InfoModal
        isOpen={infoMessage !== null}
        onClose={() => setInfoMessage(null)}
        message={infoMessage || ""}
        title="Info"
      />
    </div>
  );
}
