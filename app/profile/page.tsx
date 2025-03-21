"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ErrorModal } from "@/components/ErrorModal";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session, status, router]);

  const handleUpdateName = async () => {
    if (!name.trim()) {
      setErrorMessage("Name cannot be empty");
      return;
    }

    try {
      const response = await fetch("/api/user/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      // Sign in again to refresh the session with new data
      await signIn("credentials", {
        email: session?.user?.email,
        password: "", // The password will be ignored by the authorize function
        redirect: false,
      });

      setIsEditing(false);
    } catch {
      setErrorMessage("Failed to update profile");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="p-6 w-full bg-gradient-to-r from-emerald-600/20 to-blue-500/20">
            <h1 className="text-2xl font-bold text-white">Profile</h1>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <div className="text-white">{user.email}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Name
              </label>
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 bg-slate-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    autoFocus
                  />
                  <button
                    onClick={handleUpdateName}
                    className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setName(user.name || "");
                      setIsEditing(false);
                    }}
                    className="bg-slate-700 text-white px-4 py-2 rounded hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="text-white">{user.name}</div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ErrorModal
        isOpen={errorMessage !== null}
        onClose={() => setErrorMessage(null)}
        message={errorMessage || ""}
      />
    </div>
  );
}
