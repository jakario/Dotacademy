import type { Metadata } from "next";
import { Inter, Noto_Sans_Thai } from "next/font/google";
import "../globals.css";
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoSansThai = Noto_Sans_Thai({ subsets: ["thai"], variable: "--font-noto-thai" });

export const metadata: Metadata = {
  title: "DOT Academy",
  description: "E-Learning Platform",
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
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
