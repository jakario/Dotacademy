import type { Metadata } from "next";
import { Inter, Noto_Sans_Thai } from "next/font/google";
import "../globals.css";
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import FloatingChatbot from "@/components/FloatingChatbot";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoSansThai = Noto_Sans_Thai({ subsets: ["thai"], variable: "--font-noto-thai" });

export const metadata: Metadata = {
  title: "DOT Knowledge & Learning | กรมการท่องเที่ยว",
  description: "ระบบการเรียนรู้และจัดการความรู้ กรมการท่องเที่ยว สำหรับการเรียนรู้ด้านการท่องเที่ยว มัคคุเทศก์ และมาตรฐานธุรกิจนำเที่ยว",
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${inter.variable} ${notoSansThai.variable} font-sans antialiased bg-gray-50 text-gray-900`}>
        {/* Skip Navigation Link - WCAG 2.4.1 */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:font-semibold"
        >
          ข้ามไปยังเนื้อหาหลัก
        </a>
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          <FloatingChatbot />
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
