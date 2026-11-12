import type { Metadata, Viewport } from "next";
import { fontClasses } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: { default: "Admin · World of Stationery", template: "%s · Admin · World of Stationery" },
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = { themeColor: "#1B3A6B" };

/** The admin console is English only and never cached. */
export const dynamic = "force-dynamic";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontClasses}>
      <body className="bg-paper">{children}</body>
    </html>
  );
}
