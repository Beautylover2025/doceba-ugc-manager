// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// ⬇️ shadcn Toaster
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Doceba UGC Manager",
  description: "Admin- und Creator-Dashboard für UGC-Uploads",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        {children}
        {/* Toast-Portal */}
        <Toaster />
      </body>
    </html>
  );
}
