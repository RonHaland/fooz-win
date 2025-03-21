"use client";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { ProfileIcon } from "@/components/icons";
import { LogOutIcon } from "@/components/icons";
import { MenuIcon } from "@/components/icons";
import { XIcon } from "@/components/icons";

export function MobileMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest(".mobile-menu")) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!session?.user) return null;

  return (
    <div className="relative mobile-menu">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors duration-200 relative z-50"
        aria-label="Toggle menu"
      >
        <div className="relative w-6 h-6">
          <XIcon
            className={`absolute inset-0 w-6 h-6 text-slate-300 transition-all duration-200 transform ${
              isOpen ? "opacity-100 rotate-0" : "opacity-0 rotate-90"
            }`}
          />
          <MenuIcon
            className={`absolute inset-0 w-6 h-6 text-slate-300 transition-all duration-200 transform ${
              isOpen ? "opacity-0 -rotate-90" : "opacity-100 rotate-0"
            }`}
          />
        </div>
      </button>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-200 z-40 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      <div
        className={`absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg border border-slate-700/50 py-2 z-50 transition-all duration-200 transform origin-top-right ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
      >
        <Link
          href="/profile"
          className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
          onClick={() => setIsOpen(false)}
        >
          <ProfileIcon className="w-5 h-5" />
          <span>Profile</span>
        </Link>
        <button
          onClick={() => {
            signOut({ callbackUrl: "/" });
            setIsOpen(false);
          }}
          className="flex items-center gap-2 w-full px-4 py-2 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
        >
          <LogOutIcon className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
