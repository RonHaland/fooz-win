"use client";

import { useState } from "react";

type NewTournamentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreateTournament: (name: string) => void;
};

export function NewTournamentModal({
  isOpen,
  onClose,
  onCreateTournament,
}: NewTournamentModalProps) {
  const [name, setName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (name.trim()) {
      onCreateTournament(name.trim());
      setName("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-4">New Tournament</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tournament name"
          className="w-full bg-slate-700/50 text-white rounded-lg px-4 py-3 mb-4 border border-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 transition-colors hover:cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-emerald-700 text-white hover:bg-emerald-600 transition-colors hover:cursor-pointer"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
