import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter, SiteHeader } from "../components/site-header";

export const metadata: Metadata = {
  metadataBase: new URL("https://youzhao-guide.com"),
  title: {
    default: "Apple ID、海外 App 和 AI 工具使用教程 - 有招",
    template: "%s - 有招",
  },
  description: "Apple ID、App Store、ChatGPT、Telegram、Twitter、Instagram、TikTok、Gmail、YouTube 和苹果礼品卡常见问题，直接给解决办法。",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "有招",
    title: "Apple ID、海外 App 和 AI 工具使用教程",
    description: "遇到问题直接找办法。Apple ID、AI 工具、海外社交平台、Google 服务和礼品卡实用教程。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
