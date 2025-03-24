"use client";

import { Tournament } from "@/types/game";
import { TrashIcon } from "@/components/icons";

interface AccessManagementSectionProps {
  tournament: Tournament;
  newUserEmail: string;
  onAddUserByEmail: (isAdmin: boolean) => void;
  onDeleteUser: (userId: string) => void;
  setNewUserEmail: (email: string) => void;
}

export function AccessManagementSection({
  tournament,
  newUserEmail,
  onAddUserByEmail,
  onDeleteUser,
  setNewUserEmail,
}: AccessManagementSectionProps) {
  return (
    <section className="bg-slate-800/50 rounded-xl border border-slate-700/50">
      <div className="p-6 w-full bg-gradient-to-r from-emerald-600/20 to-blue-500/20 rounded-t-xl">
        <h2 className="text-2xl font-bold text-white">Manage access</h2>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex flex-col gap-2">
          {tournament.users.map((u) => (
            <div key={u.id} className="flex justify-between">
              <span>{u.email}</span>
              <button onClick={() => onDeleteUser(u.id)}>delete</button>
            </div>
          ))}
          {tournament.admins.map((u) => (
            <div key={u.id} className="flex justify-between items-center">
              <span>{u.email}</span>
              <button
                onClick={() => onDeleteUser(u.id)}
                className="text-red-400 hover:text-red-600 bg-slate-500/50 p-2 rounded-md hover:bg-slate-600/50"
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <input
            type="email"
            placeholder="Enter user email address"
            className="bg-slate-700 text-white rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
          />
          <div className="space-x-2">
            <button
              onClick={() => onAddUserByEmail(false)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Add User
            </button>
            <button
              onClick={() => onAddUserByEmail(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Add Admin
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
