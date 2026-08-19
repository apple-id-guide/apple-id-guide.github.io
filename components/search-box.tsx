"use client";

import { useMemo, useState } from "react";
import { articles, articleHref, getCategory } from "../lib/content";

export function SearchBox({ full = false }: { full?: boolean }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return full ? articles : [];
    return articles.filter((item) => `${item.title} ${item.description} ${item.answer}`.toLowerCase().includes(needle));
  }, [query, full]);

  return (
    <div className={full ? "search-panel full" : "search-panel"}>
      <label className="sr-only" htmlFor={full ? "site-search-full" : "site-search"}>搜索文章</label>
      <div className="search-control">
        <input
          id={full ? "site-search-full" : "site-search"}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜一搜你遇到的问题，例如：Apple ID 改不了地区"
        />
        <span aria-hidden="true">搜索</span>
      </div>
      {(query || full) && (
        <div className="search-results" aria-live="polite">
          {results.length ? results.slice(0, full ? 30 : 6).map((item) => (
            <a href={articleHref(item)} key={`${item.category}-${item.slug}`}>
              <small>{getCategory(item.category)?.name}</small>
              <strong>{item.title}</strong>
            </a>
          )) : <p>没找到完全对应的文章，换个短一点的关键词试试。</p>}
        </div>
      )}
    </div>
  );
}

