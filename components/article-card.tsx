import { Article, articleHref, getCategory } from "../lib/content";

export function ArticleCard({ item, compact = false }: { item: Article; compact?: boolean }) {
  const category = getCategory(item.category);
  return (
    <article className={compact ? "article-card compact" : "article-card"}>
      <a href={articleHref(item)}>
        <span className="eyebrow">{category?.name}</span>
        <h3>{item.title}</h3>
        {!compact && <p>{item.description}</p>}
        <span className="text-link">查看解决办法 <span aria-hidden="true">→</span></span>
      </a>
    </article>
  );
}

