import Link from "next/link";
import type { Metadata } from "next";
import { ActionForm } from "@/components/admin/ActionForm";
import { AuthCard } from "@/components/admin/AuthCard";
import { MIN_PASSWORD, setupLinkOwner } from "@/lib/admin/auth";
import { setupAction } from "../auth-actions";

export const metadata: Metadata = { title: "Set your password", referrer: "no-referrer" };

export default async function SetupPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = (await searchParams).token ?? "";
  const email = await setupLinkOwner(token);

  if (!email) {
    return (
      <AuthCard title="Link not valid">
        <p className="m-0">This setup link has expired or was already used. Ask an owner to make a new one in Admin users.</p>
        <Link href="/admin/login/" className="font-semibold">
          Go to sign in
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Set your password">
      <p className="m-0">
        For <strong>{email}</strong>. Use at least {MIN_PASSWORD} characters; a short sentence is easy to remember and hard to guess.
      </p>
      <ActionForm action={setupAction} submit="Save password and sign in">
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="email" value={email} autoComplete="username" />
        <label className="flex flex-col gap-1.5 font-semibold">
          New password
          <input name="password" type="password" required minLength={MIN_PASSWORD} autoComplete="new-password" className="admin-input font-normal" />
        </label>
        <label className="flex flex-col gap-1.5 font-semibold">
          Type it again
          <input name="confirm" type="password" required minLength={MIN_PASSWORD} autoComplete="new-password" className="admin-input font-normal" />
        </label>
      </ActionForm>
    </AuthCard>
  );
}
