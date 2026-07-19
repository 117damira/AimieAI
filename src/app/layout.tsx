import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { UserProfileProvider } from "@/lib/profile/UserProfileContext";
import { APP_NAME } from "@/config/app";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${APP_NAME} — AI Exam Preparation`,
  description:
    "AI-powered exam preparation platform with professional examiner-style feedback. Starting with DELF.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <LanguageProvider>
          <UserProfileProvider>{children}</UserProfileProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
