import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AuthStatus } from "@/components/AuthStatus";

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
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
              <div className="flex justify-end mb-8">
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
