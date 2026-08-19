import type { MetadataRoute } from "next";
import { articles, categories } from "../lib/content";
const base = "https://youzhao-guide.hotbirdnet.chatgpt.site";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: base, lastModified: new Date("2026-08-19"), changeFrequency: "weekly", priority: 1 },
    ...categories.map((item) => ({ url: `${base}/${item.slug}`, lastModified: new Date("2026-08-19"), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...articles.map((item) => ({ url: `${base}/${item.category}/${item.slug}`, lastModified: new Date(item.date), changeFrequency: "monthly" as const, priority: item.hot ? 0.9 : 0.7 })),
  ];
}
