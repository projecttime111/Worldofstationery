"use server";

import { redirect } from "next/navigation";
import type { ActionState } from "@/components/admin/ActionForm";
import { completeSetup, signIn, signOut } from "@/lib/admin/auth";

export async function signInAction(_: ActionState, data: FormData): Promise<ActionState> {
  const result = await signIn(String(data.get("email") ?? ""), String(data.get("password") ?? ""));
  if (!result.ok) return { ok: false, message: result.error };
  redirect("/admin/");
}

export async function setupAction(_: ActionState, data: FormData): Promise<ActionState> {
  const password = String(data.get("password") ?? "");
  if (password !== String(data.get("confirm") ?? "")) return { ok: false, message: "The two passwords are not the same." };
  const result = await completeSetup(String(data.get("token") ?? ""), password);
  if (!result.ok) return { ok: false, message: result.error };
  redirect("/admin/");
}

export async function signOutAction() {
  await signOut();
  redirect("/admin/login/");
}
