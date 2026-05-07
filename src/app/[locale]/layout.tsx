import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import "@/app/globals.css";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Globe } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "What is War - 全球战争日报",
  description: "记录全球每天战争情况的网站，让历史'实时发生'",
};

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();
  const t = await getTranslations({ locale });

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      dir={locale === 'fa' ? 'rtl' : 'ltr'}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between py-3">
                <a href={`/${locale}`} className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <span className="text-2xl">🔥</span>
                  {t('site.title')}
                </a>
                <LanguageSwitcher />
              </div>
              
              {/* 战争导航按钮 */}
              <nav className="flex items-center gap-2 pb-3 overflow-x-auto">
                <a
                  href={`/${locale}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-sm font-medium"
                >
                  <Globe className="h-4 w-4" />
                  {t('nav.home')}
                </a>
                <a
                  href={`/${locale}/ukraine`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors text-sm font-medium"
                >
                  🇷🇺🇺🇦 {t('nav.ukraine')}
                </a>
                <a
                  href={`/${locale}/middle-east`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 transition-colors text-sm font-medium"
                >
                  🇵🇸🇮🇱 {t('nav.middleEast')}
                </a>
                <a
                  href={`/${locale}/us-iran`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition-colors text-sm font-medium"
                >
                  🇺🇸🇮🇱🇮🇷 {t('nav.usIran')}
                </a>
                <a
                  href={`/${locale}/timeline`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors text-sm font-medium"
                >
                  📊 {t('nav.timeline')}
                </a>
                <a
                  href={`/${locale}/humanitarian`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 transition-colors text-sm font-medium"
                >
                  🏥 {t('nav.humanitarian')}
                </a>
              </nav>
            </div>
          </header>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}