"use client";

import { useRef } from "react";

const LANGS = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "mr", label: "मराठी" },
] as const;

/** One site text in English, Hindi and Marathi, side by side, with "Copy from English". */
export function TextRow({
  path,
  label,
  values,
  changed,
}: {
  path: string;
  label: string;
  values: Record<"en" | "hi" | "mr", string>;
  changed: boolean;
}) {
  const refs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const rows = Math.min(8, Math.max(1, Math.ceil(values.en.length / 60)));

  return (
    <fieldset className="m-0 flex flex-col gap-2 border-0 border-b border-line p-0 pb-5 last:border-b-0">
      <input type="hidden" name="path" value={path} />
      <legend className="mb-2 flex w-full flex-wrap items-center justify-between gap-2">
        <span className="font-semibold">
          {label}
          {changed && <span className="ml-2 rounded-pill bg-yellow/40 px-2 py-0.5 text-xs font-bold">edited</span>}
        </span>
        <button
          type="button"
          className="min-h-11 cursor-pointer text-sm font-semibold text-navy underline"
          onClick={() => {
            const en = refs.current.en?.value ?? "";
            for (const l of ["hi", "mr"]) if (refs.current[l]) refs.current[l]!.value = en;
          }}
        >
          Copy from English
        </button>
      </legend>
      <div className="grid gap-3 lg:grid-cols-3">
        {LANGS.map((l) => (
          <label key={l.code} className="flex flex-col gap-1 text-sm text-muted">
            {l.label}
            <textarea
              ref={(el) => {
                refs.current[l.code] = el;
              }}
              name={`${l.code}:${path}`}
              lang={l.code}
              defaultValue={values[l.code]}
              rows={rows}
              className="admin-input resize-y text-[15px] text-ink"
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
