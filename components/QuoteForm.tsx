"use client";

import { useRef, useState, type FormEvent } from "react";
import { submitEnquiry, type MessageLabels } from "@/lib/submitEnquiry";

export type QuoteFormText = {
  ariaLabel: string;
  title: string;
  org: string;
  type: string;
  types: string[];
  name: string;
  phone: string;
  phoneHint: string;
  area: string;
  needs: string;
  consent: string;
  required: string;
  submit: string;
  prefer: string;
  errorSummary: string;
  errors: { name: string; phone: string; consent: string };
  opened: string;
  message: MessageLabels;
};

type Field = "name" | "phone" | "consent";
type Errors = Partial<Record<Field, string>>;

/** Accepts 98765 43210, +91 98765-43210, 098765 43210. Indian mobiles start with 6 to 9. */
export function normaliseIndianMobile(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

const input =
  "min-h-12 w-full rounded-[10px] border bg-white px-3.5 text-base text-ink placeholder:text-muted";

export function QuoteForm({ t, whatsapp }: { t: QuoteFormText; whatsapp: string }) {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (k: string) => String(data.get(k) ?? "").trim();

    const next: Errors = {};
    const name = get("name");
    const phone = normaliseIndianMobile(get("phone"));
    if (!name) next.name = t.errors.name;
    if (!phone) next.phone = t.errors.phone;
    if (!data.get("consent")) next.consent = t.errors.consent;
    setErrors(next);

    const firstBad = (["name", "phone", "consent"] as Field[]).find((f) => next[f]);
    if (firstBad) {
      setSent(false);
      const refs = { name: nameRef, phone: phoneRef, consent: consentRef };
      refs[firstBad].current?.focus();
      return;
    }

    submitEnquiry(
      { org: get("org"), type: get("type"), name, phone: phone!, area: get("area"), needs: get("needs") },
      t.message,
      whatsapp,
    );
    setSent(true);
  };

  const describedBy = (f: Field, extra?: string) =>
    [extra, errors[f] ? `${f}-error` : null].filter(Boolean).join(" ") || undefined;

  const border = (f: Field) => (errors[f] ? "border-error border-2" : "border-field");

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form
      aria-label={t.ariaLabel}
      noValidate
      onSubmit={onSubmit}
      className="flex min-w-0 flex-[1_1_440px] flex-col gap-[18px] rounded-photo border border-line bg-paper p-5 sm:p-8"
    >
      <h2 className="m-0 font-heading text-[26px] font-extrabold text-navy sm:text-[30px]">{t.title}</h2>

      <div role="alert" className={hasErrors ? "rounded-[10px] border-2 border-error bg-white p-3 text-[15px] font-semibold text-error" : "sr-only"}>
        {hasErrors ? t.errorSummary : ""}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="org" className="text-[15px] font-semibold">
          {t.org}
        </label>
        <input id="org" name="org" type="text" autoComplete="organization" className={`${input} border-field`} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="type" className="text-[15px] font-semibold">
          {t.type}
        </label>
        <select id="type" name="type" className={`${input} border-field px-3`}>
          {t.types.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex min-w-0 flex-[1_1_180px] flex-col gap-1.5">
          <label htmlFor="name" className="text-[15px] font-semibold">
            {t.name} <span className="font-normal text-muted">({t.required})</span>
          </label>
          <input
            ref={nameRef}
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            aria-invalid={!!errors.name}
            aria-describedby={describedBy("name")}
            className={`${input} ${border("name")}`}
          />
          {errors.name && (
            <p id="name-error" className="m-0 text-sm font-semibold text-error">
              {errors.name}
            </p>
          )}
        </div>
        <div className="flex min-w-0 flex-[1_1_180px] flex-col gap-1.5">
          <label htmlFor="phone" className="text-[15px] font-semibold">
            {t.phone} <span className="font-normal text-muted">({t.required})</span>
          </label>
          <input
            ref={phoneRef}
            id="phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            required
            aria-invalid={!!errors.phone}
            aria-describedby={describedBy("phone", "phone-hint")}
            className={`${input} ${border("phone")}`}
          />
          <p id="phone-hint" className="m-0 text-sm text-muted">
            {t.phoneHint}
          </p>
          {errors.phone && (
            <p id="phone-error" className="m-0 text-sm font-semibold text-error">
              {errors.phone}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="area" className="text-[15px] font-semibold">
          {t.area}
        </label>
        <input id="area" name="area" type="text" autoComplete="address-level2" className={`${input} border-field`} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="needs" className="text-[15px] font-semibold">
          {t.needs}
        </label>
        <textarea
          id="needs"
          name="needs"
          rows={4}
          className="w-full resize-y rounded-[10px] border border-field bg-white px-3.5 py-3 text-base text-ink"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-start gap-3">
          <input
            ref={consentRef}
            id="consent"
            name="consent"
            type="checkbox"
            required
            aria-invalid={!!errors.consent}
            aria-describedby={describedBy("consent")}
            className="mt-0.5 h-[22px] w-[22px] shrink-0 accent-navy"
          />
          <label htmlFor="consent" className="text-[15px] leading-normal text-body">
            {t.consent} <span className="text-muted">({t.required})</span>
          </label>
        </div>
        {errors.consent && (
          <p id="consent-error" className="m-0 text-sm font-semibold text-error">
            {errors.consent}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="min-h-[52px] cursor-pointer rounded-pill border-0 bg-navy text-[17px] font-semibold text-white hover:bg-navy-dark"
      >
        {t.submit}
      </button>

      <p role="status" className={sent ? "m-0 rounded-[10px] bg-white p-3 text-[15px] font-semibold text-wa" : "sr-only"}>
        {sent ? t.opened : ""}
      </p>

      <p className="m-0 text-sm text-muted">{t.prefer}</p>
    </form>
  );
}
