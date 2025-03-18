import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}

export const viewport = {
  themeColor: "#0f172a",
  viewTransitions: true,
};
