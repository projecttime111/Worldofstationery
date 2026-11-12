import type { ReactNode } from "react";

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-2">
      <h1 className="m-0 font-heading text-[28px] leading-tight font-extrabold text-navy md:text-[34px]">{title}</h1>
      {children && <div className="m-0 max-w-[720px] text-[16px] leading-normal text-body">{children}</div>}
    </div>
  );
}

/** Label + control, with an optional hint under the label. */
export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="font-semibold">{label}</span>
      {hint && <span className="-mt-1 text-sm text-muted">{hint}</span>}
      {children}
    </label>
  );
}
