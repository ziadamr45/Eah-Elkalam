import type { Metadata } from "next";
import { Cairo, Tajawal } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "إيه الكلام؟ | Eh El-Kalam? - Egyptian Trend Radar",
  description: "منصة رادار الترندات المصرية - الشارع مقلوب دلوقتي على إيه؟ تابع كل الترندات لحظة بلحظة",
  keywords: ["ترندات مصر", "إيه الكلام", "Egyptian trends", "رادار الترندات"],
  authors: [{ name: "Eh El-Kalam Team" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/logo.png", type: "image/png" },
    ],
    apple: "/apple-icon.png",,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark" suppressHydrationWarning>
      <body
        className={`${cairo.variable} ${tajawal.variable} antialiased bg-[#0B0F19] text-white font-[family-name:var(--font-cairo)]`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
