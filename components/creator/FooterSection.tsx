"use client";

import Link from "next/link";

export const FooterSection = () => {
  return (
    <div className="py-10 text-center text-sm text-muted-foreground">
      <div className="flex items-center justify-center gap-6">
        <Link href="/support">Support & Hilfe</Link>
        <Link href="/privacy">Datenschutz</Link>
        <Link href="/logout">Abmelden</Link>
      </div>
      <p className="mt-4">&copy; {new Date().getFullYear()} Creator Dashboard</p>
    </div>
  );
};
