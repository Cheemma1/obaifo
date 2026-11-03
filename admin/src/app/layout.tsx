import type { Metadata } from "next";
import { Bricolage_Grotesque, Literata } from "next/font/google";
import { Providers } from "@/components/shell";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin", "latin-ext", "vietnamese"],
  axes: ["opsz", "wdth"],
});

/** Tale titles are Igbo and set in Literata, as on the reader site. */
const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin", "latin-ext", "vietnamese"],
});

export const metadata: Metadata = {
  title: { default: "Ọbaifo Admin", template: "%s · Ọbaifo Admin" },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${literata.variable}`}>
      <body className="min-h-dvh">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
