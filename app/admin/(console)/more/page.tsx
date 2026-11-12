import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "More" };

/** Everything in the console, for phones (the bottom bar only fits five tabs). */
export default async function MorePage() {
  const admin = await requireAdmin();
  const links = [
    { href: "/admin/texts/", label: "Site text", text: "Every word on the website, in English, Hindi and Marathi." },
    ...(admin.role === "owner"
      ? [
          { href: "/admin/users/", label: "Admin users", text: "Who can sign in, and their role." },
          { href: "/admin/history/", label: "Change history", text: "Who changed what, and when." },
        ]
      : []),
    { href: "/en/", label: "View the website", text: "Opens the public site." },
  ];
  return (
    <>
      <PageHeader title="More" />
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {links.map((l) => (
          <li key={l.href}>
            <a href={l.href} className="admin-card flex flex-col gap-1 text-ink no-underline hover:border-navy">
              <span className="font-bold text-navy">{l.label}</span>
              <span className="text-[15px] text-body">{l.text}</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-muted">
        Signed in as {admin.email} ({admin.role}).
      </p>
    </>
  );
}
