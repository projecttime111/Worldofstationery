import type { Metadata } from "next";
import { ActionForm } from "@/components/admin/ActionForm";
import { Field, PageHeader } from "@/components/admin/PageHeader";
import { requireOwner } from "@/lib/admin/auth";
import { asAdmin } from "@/lib/db";
import { inviteAdmin, newLinkFor, removeAdmin, updateAdmin } from "../actions";

export const metadata: Metadata = { title: "Admin users" };

const when = (v: unknown) =>
  v ? new Date(String(v)).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }) : "never";

function RoleSelect({ value }: { value?: string }) {
  return (
    <select name="role" defaultValue={value ?? "staff"} className="admin-input">
      <option value="staff">Staff: content (and enquiries, once added)</option>
      <option value="owner">Owner: everything, including admins</option>
    </select>
  );
}

export default async function UsersPage() {
  const owner = await requireOwner();
  const [admins] = await asAdmin(owner.email, (tx) => [
    tx`select email, role, display_name, created_at, last_login_at, setup_expires_at
       from public.admin_users order by role, email`,
  ]);

  return (
    <>
      <PageHeader title="Admin users">
        <p className="m-0">
          Owners can do everything. Staff can edit content but cannot manage admins or see the change history. A new admin gets a
          one-time setup link to choose their own password; send it to them yourself.
        </p>
      </PageHeader>

      <ul className="m-0 flex list-none flex-col gap-4 p-0">
        {admins.map((a) => {
          const email = String(a.email);
          const me = email === owner.email;
          const pending = a.setup_expires_at && !a.last_login_at;
          return (
            <li key={email} className="admin-card flex flex-col gap-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="m-0 text-lg font-bold break-all">
                  {String(a.display_name || email)} {me && <span className="text-sm font-semibold text-muted">(you)</span>}
                </h2>
                <span className="text-sm text-muted">
                  {pending ? "Invited, has not signed in yet" : `Last sign-in: ${when(a.last_login_at)}`}
                </span>
              </div>
              <p className="-mt-2 m-0 text-sm break-all text-muted">{email}</p>
              <ActionForm action={updateAdmin} submit="Save">
                <input type="hidden" name="email" value={email} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name">
                    <input name="display_name" defaultValue={String(a.display_name ?? "")} className="admin-input" />
                  </Field>
                  <Field label="Role">
                    <RoleSelect value={String(a.role)} />
                  </Field>
                </div>
              </ActionForm>
              <div className="flex flex-wrap gap-x-6">
                <details>
                  <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-navy">
                    New setup link (new password)
                  </summary>
                  <ActionForm action={newLinkFor} submit="Make a new setup link" className="mt-2">
                    <input type="hidden" name="email" value={email} />
                  </ActionForm>
                </details>
                {!me && (
                  <details>
                    <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-error">Remove</summary>
                    <ActionForm action={removeAdmin} submit={`Remove ${email}`} danger confirm={`Remove ${email}? They are signed out at once.`} className="mt-2">
                      <input type="hidden" name="email" value={email} />
                    </ActionForm>
                  </details>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <section className="admin-card mt-6">
        <h2 className="m-0 mb-3 text-lg font-bold">Add an admin</h2>
        <ActionForm action={inviteAdmin} submit="Add and make a setup link">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Email">
              <input name="email" type="email" required className="admin-input" />
            </Field>
            <Field label="Name">
              <input name="display_name" className="admin-input" />
            </Field>
            <Field label="Role">
              <RoleSelect />
            </Field>
          </div>
        </ActionForm>
      </section>
    </>
  );
}
