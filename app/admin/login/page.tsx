import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ActionForm } from "@/components/admin/ActionForm";
import { AuthCard } from "@/components/admin/AuthCard";
import { getAdmin } from "@/lib/admin/auth";
import { databaseConfigured } from "@/lib/db";
import { signInAction } from "../auth-actions";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin/");
  return (
    <AuthCard title="Admin sign in">
      {!databaseConfigured() && (
        <p className="m-0 rounded-xl bg-yellow/30 p-3 text-sm">The database is not connected (DATABASE_URL is missing), so nobody can sign in yet.</p>
      )}
      <ActionForm action={signInAction} submit="Sign in">
        <label className="flex flex-col gap-1.5 font-semibold">
          Email
          <input name="email" type="email" required autoComplete="username" className="admin-input font-normal" />
        </label>
        <label className="flex flex-col gap-1.5 font-semibold">
          Password
          <input name="password" type="password" required autoComplete="current-password" className="admin-input font-normal" />
        </label>
      </ActionForm>
      <p className="m-0 text-sm text-muted">
        New here, or forgot your password? Ask an owner for a setup link. You stay signed in for 12 hours.
      </p>
    </AuthCard>
  );
}
