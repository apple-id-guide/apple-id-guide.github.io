import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter, SiteHeader } from "../components/site-header";

export const metadata: Metadata = {
  metadataBase: new URL("https://youzhao-guide.com"),
  title: {
    default: "Apple ID、海外 App 和 AI 工具使用教程 - 有招指南",
    template: "%s - 有招指南",
  },
  description: "Apple ID 改地区、App Store 下载、ChatGPT 订阅、Codex 安装和 Telegram 验证码等常见问题，直接给解决办法。",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "有招指南",
    title: "Apple ID、海外 App 和 AI 工具使用教程",
    description: "遇到问题直接找办法。Apple ID、App Store、ChatGPT、Codex 和 Telegram 实用教程。",
    images: [{ url: "/og.png", width: 1728, height: 907, alt: "有招指南：Apple ID、海外 App 和 AI 工具使用教程" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Apple ID、海外 App 和 AI 工具使用教程",
    description: "遇到问题，直接找办法。",
    images: ["/og.png"],
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
