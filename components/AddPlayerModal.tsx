"use client";
import { useState } from "react";

type AddPlayerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
  existingNames: string[];
};

export function AddPlayerModal({
  isOpen,
  onClose,
  onAdd,
  existingNames,
}: AddPlayerModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Name is required");
      return;
    }

    if (existingNames.includes(trimmedName)) {
      setError("This name already exists");
      return;
    }

    onAdd(trimmedName);
    setName("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">Add New Player</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="Player name"
              className="w-full px-4 py-2 rounded-lg bg-slate-700/50 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
            {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-700/70 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              Add Player
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
