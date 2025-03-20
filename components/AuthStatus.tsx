"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOutIcon } from "@/components/icons";
import { useRouter } from "next/navigation";

export function AuthStatus() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="flex items-center gap-4">
      {session ? (
        <>
          <span className="text-slate-300 text-sm">
            {session.user?.name || "User"}
          </span>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 
                     text-slate-300 rounded-lg transition-colors duration-200"
          >
            <LogOutIcon className="h-4 w-4" />
            <span className="text-sm">Logout</span>
          </button>
        </>
      ) : (
        <button
          onClick={() => router.push("/login")}
          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 
                   text-white rounded-lg transition-colors duration-200"
        >
          <span className="text-sm">Login</span>
        </button>
      )}
    </div>
  );
}
