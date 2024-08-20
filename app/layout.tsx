import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "預售屋價格追蹤 | 台灣房地產市場分析",
  description:
    "追蹤台灣預售屋價格變化，提供即時市場分析和趨勢報告。覆蓋台北、新北、桃園等主要城市，幫助您做出明智的房地產投資決策。",
  keywords:
    "預售屋, 房價追蹤, 台灣房地產, 房地產投資, 市場分析, 台北, 新北, 桃園",
  openGraph: {
    title: "預售屋價格追蹤 | 台灣房地產市場分析",
    description:
      "追蹤台灣預售屋價格變化，提供即時市場分析和趨勢報告。覆蓋台北、新北、桃園等主要城市。",
    type: "website",
    url: "https://trace-price.vercel.app/",
  },
  twitter: {
    card: "summary_large_image",
    title: "預售屋價格追蹤 | 台灣房地產市場分析",
    description: "追蹤台灣預售屋價格變化，提供即時市場分析和趨勢報告。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <head>
        <link rel="canonical" href="https://trace-price.vercel.app/" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
