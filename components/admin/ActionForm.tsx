"use client";

import { startTransition, useActionState, type ReactNode } from "react";

export type ActionState = { ok: boolean; message: string; link?: string } | null;

/**
 * A form that runs a server action and shows its result (saved, or what went wrong).
 * The submit button is disabled while the action runs. The action is started from onSubmit
 * (not the form's action prop), so React does not clear what was typed: after an error the
 * admin can correct one field instead of starting again.
 */
export function ActionForm({
  action,
  children,
  submit,
  className = "",
  danger = false,
  confirm,
}: {
  action: (state: ActionState, data: FormData) => Promise<ActionState>;
  children?: ReactNode;
  submit: string;
  className?: string;
  danger?: boolean;
  confirm?: string;
}) {
  const [state, run, pending] = useActionState(action, null);
  return (
    <form
      className={`flex flex-col gap-4 ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        if (confirm && !window.confirm(confirm)) return;
        const data = new FormData(e.currentTarget);
        startTransition(() => run(data));
      }}
    >
      {children}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className={`inline-flex min-h-11 items-center justify-center rounded-pill px-5 text-[15px] font-semibold text-white transition disabled:opacity-60 ${
            danger ? "bg-error hover:brightness-90" : "bg-navy hover:bg-navy-dark"
          }`}
        >
          {pending ? "Working…" : submit}
        </button>
        {state && (
          <p role="status" className={`m-0 text-[15px] font-semibold ${state.ok ? "text-wa" : "text-error"}`}>
            {state.message}
          </p>
        )}
      </div>
      {state?.link && (
        <div className="rounded-xl border border-line bg-white p-3">
          <p className="m-0 mb-2 text-sm text-muted">Send this link to them yourself (for example on WhatsApp). It works once, for 7 days.</p>
          <input readOnly value={state.link} className="admin-input font-mono text-sm" onFocus={(e) => e.currentTarget.select()} />
        </div>
      )}
    </form>
  );
}
