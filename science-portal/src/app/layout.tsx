import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Science Portal — Platform Pembelajaran IPA & Fisika",
  description:
    "Platform edukasi interaktif untuk belajar IPA dan Fisika dari SD hingga SMA melalui teori singkat dan game edukatif.",
};

import AudioProvider from "./components/AudioProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AudioProvider>
          {children}
        </AudioProvider>
      </body>
    </html>
  );
}
