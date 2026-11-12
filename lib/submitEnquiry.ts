import { whatsappUrl } from "@/content/business";

export type Enquiry = {
  org: string;
  type: string;
  name: string;
  phone: string;
  area: string;
  needs: string;
};

export type MessageLabels = {
  heading: string;
  org: string;
  type: string;
  name: string;
  phone: string;
  area: string;
  needs: string;
};

/** Neatly formatted WhatsApp message. Empty optional answers are left out. */
export function formatEnquiry(e: Enquiry, l: MessageLabels): string {
  const lines: string[] = [`*${l.heading}*`, ""];
  if (e.org) lines.push(`${l.org}: ${e.org}`);
  lines.push(`${l.type}: ${e.type}`, `${l.name}: ${e.name}`, `${l.phone}: ${e.phone}`);
  if (e.area) lines.push(`${l.area}: ${e.area}`);
  if (e.needs) lines.push(`${l.needs}:`, e.needs);
  return lines.join("\n");
}

/**
 * Sends an enquiry. Version 1 opens WhatsApp with the message ready to send.
 *
 * ── HOOK: Google Sheet logging (not built yet) ─────────────────────────────
 * To also log enquiries to a Google Sheet later:
 *   1. Create a Google Apps Script web app that appends a row from a POST body.
 *   2. Put its URL in SHEET_ENDPOINT below.
 *   3. Uncomment the fetch. Use mode "no-cors" and send text/plain, so the
 *      browser does not need a CORS preflight. Never block WhatsApp on it.
 * Collect nothing about children, and update the consent text if you do this.
 * ───────────────────────────────────────────────────────────────────────────
 */
const SHEET_ENDPOINT: string | null = null;

export function submitEnquiry(enquiry: Enquiry, labels: MessageLabels, whatsapp: string): void {
  const url = whatsappUrl(whatsapp, formatEnquiry(enquiry, labels));

  if (SHEET_ENDPOINT) {
    // void fetch(SHEET_ENDPOINT, {
    //   method: "POST",
    //   mode: "no-cors",
    //   headers: { "Content-Type": "text/plain;charset=utf-8" },
    //   body: JSON.stringify({ ...enquiry, submittedAt: new Date().toISOString() }),
    // });
  }

  // New tab on desktop; if the browser blocks it, go there in this tab (phones open the app).
  const win = window.open(url, "_blank");
  if (win) win.opener = null;
  else window.location.href = url;
}
