import type { Metadata } from "next";
import { SearchBox } from "../../components/search-box";

export const metadata: Metadata = { title: "搜索文章", description: "搜索 Apple ID、App Store、ChatGPT、Codex 和 Telegram 常见问题。", robots: { index: false, follow: true } };

export default function SearchPage() {
  return <section className="section wrap search-page"><span className="kicker">30 篇实用教程</span><h1>搜一搜你遇到的问题</h1><p>关键词不用写太长，例如“改地区”“付款失败”“收不到验证码”。</p><SearchBox full /></section>;
}

