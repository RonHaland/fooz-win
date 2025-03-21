import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AuthStatus } from "@/components/AuthStatus";
import { FootballIcon } from "@/components/icons";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Foozball",
  description: "Tournament management for foosball",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ colorScheme: "dark" }}>
      <head>
        <meta name="view-transition" content="same-origin" />
      </head>
      <body className={`${inter.className} bg-slate-900 text-white`}>
        <Providers>
          <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
            <div className="max-w-7xl mx-auto px-0 py-8 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center mb-8 px-2">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500 
                      hover:from-emerald-300 hover:to-blue-400 transition-colors [--icon-color:var(--color-emerald-400)] 
                      hover:[--icon-color:var(--color-emerald-300)] border-2 border-transparent hover:border-emerald-300 p-2 rounded-sm"
                >
                  <FootballIcon className="w-8 h-8 text-[var(--icon-color)] transition-colors" />
                  <span className="text-xl font-bold">Foozball</span>
                </Link>
                <AuthStatus />
              </div>
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}

export const viewport = {
  themeColor: "#0f172a",
  viewTransitions: true,
};
