import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Literata } from "next/font/google";
import { Suspense } from "react";
import { DonateWidget } from "@/features/donations/donate-widget";
import { LOCALES } from "@/i18n/config";
import { I18nProvider } from "@/i18n/provider";
import { getPageI18n, metaT } from "@/i18n/server";
import { Navbar } from "@/shared/layout/navbar";
import { AppProviders } from "@/shared/providers/app-providers";
import "../globals.css";

// The vietnamese subset carries the dotted vowels Igbo needs (ị ọ ụ); latin-ext carries ṅ.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin", "latin-ext", "vietnamese"],
  axes: ["opsz", "wdth"],
});

/** Igbo tale content (titles, synopses, the tales themselves) is set in Literata. */
const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin", "latin-ext", "vietnamese"],
  axes: ["opsz"],
  style: ["normal", "italic"],
});

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const metadata: Metadata = {
  title: { default: metaT.meta.title, template: "%s · Ọbaifo" },
  description: metaT.meta.description,
  keywords: metaT.meta.keywords,
  openGraph: {
    title: metaT.meta.title,
    description: metaT.meta.description,
    siteName: "Ọbaifo",
    type: "website",
    locale: "en",
  },
  twitter: {
    card: "summary_large_image",
    title: metaT.meta.title,
    description: metaT.meta.description,
  },
  alternates: { languages: { ig: "/ig", en: "/en" } },
};

export const viewport: Viewport = {
  themeColor: "#9c3b1e",
};

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { locale } = await getPageI18n(params);
  return (
    <html
      lang={locale}
      className={`${bricolage.variable} ${literata.variable}`}
    >
      <body className="min-h-dvh">
        <I18nProvider locale={locale}>
          <AppProviders>
            <Suspense fallback={null}>
              <Navbar />
            </Suspense>
            {children}
            <Suspense fallback={null}>
              <DonateWidget />
            </Suspense>
          </AppProviders>
        </I18nProvider>
      </body>
    </html>
  );
}
