import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Noto_Sans_Sinhala, Noto_Sans_Tamil } from "next/font/google";
import { BottomBar } from "@/components/layout/BottomBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { I18nProvider } from "@/i18n/client";
import { getMessages } from "@/i18n/messages";
import { getLocale, getTranslator } from "@/i18n/server";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const notoSinhala = Noto_Sans_Sinhala({
  subsets: ["sinhala", "latin"],
  variable: "--font-sinhala",
  display: "swap",
});

// Tamil comes later; the browser only downloads this font when Tamil text appears.
const notoTamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  variable: "--font-tamil",
  display: "swap",
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("meta.title"), description: t("meta.description") };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fffaf3" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1630" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const { t } = await getTranslator();

  return (
    <html
      lang={locale}
      className={`${bricolage.variable} ${notoSinhala.variable} ${notoTamil.variable}`}
    >
      <body className="flex min-h-dvh flex-col antialiased">
        <I18nProvider locale={locale} messages={getMessages(locale)}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-button focus:bg-surface focus:px-4 focus:py-3 focus:font-bold"
          >
            {t("common.skipToContent")}
          </a>
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
          <BottomBar />
        </I18nProvider>
      </body>
    </html>
  );
}
