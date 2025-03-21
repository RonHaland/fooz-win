"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { ProfileIcon } from "@/components/icons/ProfileIcon";
import { LogOutIcon } from "@/components/icons/LogOutIcon";
import { LoginIcon } from "@/components/icons/LoginIcon";
import { MobileMenu } from "@/components/MobileMenu";

export function AuthStatus() {
  const { data: session } = useSession();

  if (!session?.user) {
    return (
      <div className="px-4">
        <Link
          href="/login"
          className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
        >
          <LoginIcon className="w-5 h-5" />
          <span>Login</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {/* Mobile menu */}
      <div className="sm:hidden px-4">
        <MobileMenu />
      </div>

      {/* Desktop buttons */}
      <div className="hidden sm:flex items-center gap-4">
        <Link
          href="/profile"
          className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white 
                   hover:bg-slate-700/50 rounded-lg transition-colors"
        >
          <ProfileIcon className="w-5 h-5" />
          <span>Profile</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white 
                   hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer"
        >
          <LogOutIcon className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
