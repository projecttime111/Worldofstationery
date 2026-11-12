import { Baloo_2, Inter } from "next/font/google";

// Baloo 2 for headings; it covers Devanagari, so Hindi and Marathi headings render properly.
// Only weight 800 is loaded: one weight halves the font download (the Devanagari file drops
// from 113 KB to 57 KB), which keeps Hindi and Marathi pages fast on phones.
// `subsets` only decides what is preloaded: every subset is still declared, and the browser
// fetches the Devanagari file only on pages that show Devanagari text.
// Devanagari headings use a self-hosted copy of the same file (BalooDeva in globals.css),
// preloaded on /hi and /mr pages only by app/[lang]/layout.tsx.
export const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["800"],
  variable: "--font-baloo",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const fontClasses = `${baloo.variable} ${inter.variable}`;
