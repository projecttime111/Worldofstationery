import type { ReactNode } from "react";
import { LogoMark } from "@/components/LogoMark";

/** Centred card for the sign-in and password set-up pages. */
export function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="admin-card flex w-full max-w-[420px] flex-col gap-5">
        <div className="flex items-center gap-3">
          <LogoMark id="admin-auth" size={44} />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-muted">World of Stationery</span>
            <h1 className="m-0 font-heading text-2xl font-extrabold text-navy">{title}</h1>
          </div>
        </div>
        {children}
      </div>
    </main>
  );
}
