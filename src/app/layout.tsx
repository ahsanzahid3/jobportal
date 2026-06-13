import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import { ThemeProvider } from "@/lib/theme-context";
import { I18nProvider } from "@/i18n/context";
import { AuthProvider } from "@/lib/auth-context";
import Tracker from "@/components/Tracker";
import "./globals.css";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-noto-sans",
});

export const metadata: Metadata = {
  title: "DulyHired — Find Your Next Opportunity",
  description:
    "Browse thousands of jobs worldwide. White collar, blue collar, remote, and more. Your next career move starts here.",
  keywords: [
    "jobs",
    "career",
    "employment",
    "white collar",
    "blue collar",
    "Africa jobs",
    "remote jobs",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${notoSans.variable}`}>
        <ThemeProvider><I18nProvider><AuthProvider>{children}<Tracker /></AuthProvider></I18nProvider></ThemeProvider>
      </body>
    </html>
  );
}
