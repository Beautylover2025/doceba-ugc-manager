import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Doceba UGC Manager",
  description: "Admin- und Creator-Dashboard für UGC-Uploads",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className="h-full">
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 antialiased`}>
        {children}
        {/* Toasts (Erfolg/Fehler) */}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
