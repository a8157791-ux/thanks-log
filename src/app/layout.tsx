import type { Metadata, Viewport } from "next";
import { Gowun_Batang } from "next/font/google";
import "./globals.css";

const gowunBatang = Gowun_Batang({
  variable: "--font-gowun-batang",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "땡큐로그 · Thanks Log",
  description:
    "친구·가족과 함께 쓰는 감사일기. 하루 세 가지 감사와 사진, 손그림 스티커로 마음을 나눠요.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "땡큐로그",
  },
  openGraph: {
    title: "땡큐로그 · Thanks Log",
    description:
      "친구·가족과 함께 쓰는 감사일기. 하루 세 가지 감사와 사진, 손그림 스티커로 마음을 나눠요.",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "땡큐로그 · Thanks Log",
    description:
      "친구·가족과 함께 쓰는 감사일기. 하루 세 가지 감사와 사진, 손그림 스티커로 마음을 나눠요.",
  },
};

export const viewport: Viewport = {
  themeColor: "#7d8b6f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${gowunBatang.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col bg-page text-ink">
        {children}
      </body>
    </html>
  );
}
