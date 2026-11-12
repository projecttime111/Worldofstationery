import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { requireOwner } from "@/lib/admin/auth";
import { asAdmin } from "@/lib/db";

export const metadata: Metadata = { title: "Change history" };

const when = (v: unknown) =>
  new Date(String(v)).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });

const IGNORE = new Set(["updated_at", "updated_by"]);
const show = (v: unknown) => (v === null || v === undefined || v === "" ? "(empty)" : typeof v === "object" ? JSON.stringify(v) : String(v));

/** Fields that differ between the old and new row. */
function changes(oldValue: Record<string, unknown> | null, newValue: Record<string, unknown> | null) {
  const keys = new Set([...Object.keys(oldValue ?? {}), ...Object.keys(newValue ?? {})]);
  return [...keys]
    .filter((k) => !IGNORE.has(k) && JSON.stringify(oldValue?.[k]) !== JSON.stringify(newValue?.[k]))
    .map((k) => ({ field: k.replace(/_/g, " "), from: oldValue ? show(oldValue[k]) : null, to: newValue ? show(newValue[k]) : null }));
}

export default async function HistoryPage() {
  const owner = await requireOwner();
  const [rows] = await asAdmin(owner.email, (tx) => [
    tx`select id, at, actor, table_name, row_key, action, old_value, new_value
       from public.audit_log where actor <> 'system' order by at desc limit 200`,
  ]);

  return (
    <>
      <PageHeader title="Change history">
        <p className="m-0">The last 200 changes made in the console, newest first, with the old and new values. Undoing a single change from here is coming in a later phase.</p>
      </PageHeader>
      {rows.length === 0 && <p className="admin-card m-0 text-muted">No changes yet.</p>}
      <ol className="m-0 flex list-none flex-col gap-3 p-0">
        {rows.map((r) => {
          const list = changes(r.old_value as Record<string, unknown> | null, r.new_value as Record<string, unknown> | null);
          return (
            <li key={String(r.id)} className="admin-card flex flex-col gap-2 text-[15px]">
              <div className="flex flex-wrap justify-between gap-x-4">
                <span>
                  <strong>{String(r.actor)}</strong> {String(r.action)}d <strong>{String(r.table_name).replace(/_/g, " ")}</strong>{" "}
                  <span className="text-muted">{String(r.row_key)}</span>
                </span>
                <span className="text-muted">{when(r.at)}</span>
              </div>
              {list.length > 0 && (
                <ul className="m-0 flex flex-col gap-1 pl-5">
                  {list.slice(0, 12).map((c) => (
                    <li key={c.field} className="break-words">
                      <span className="font-semibold">{c.field}:</span>{" "}
                      {c.from !== null && <span className="text-error line-through">{c.from}</span>}
                      {c.from !== null && c.to !== null && " → "}
                      {c.to !== null && <span className="text-wa">{c.to}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    </>
  );
}
