import type { Metadata } from "next";
import { ArticleCard } from "../../components/article-card";
import { categories, getCategory, getCategoryArticles } from "../../lib/content";

export async function generateStaticParams() {
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) return { title: "频道不存在" };
  return { title: category.title, description: category.description, alternates: { canonical: `/${category.slug}` } };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) return <div className="wrap empty-state"><h1>这个频道还没有内容</h1><a href="/">返回首页</a></div>;
  const items = getCategoryArticles(slug);
  return (
    <>
      <section className="channel-hero">
        <div className="wrap narrow-head">
          <div className="breadcrumbs"><a href="/">首页</a><span>/</span>{category.name}</div>
          <span className="kicker">{items.length} 个问题，逐个解决</span>
          <h1>{category.title}</h1>
          <p>{category.description}</p>
          <div className="topic-pills">{items.slice(0, 6).map((item) => <a key={item.slug} href={`/${item.category}/${item.slug}`}>{item.title.replace(/[？?].*$/, "")}</a>)}</div>
        </div>
      </section>
      <section className="section wrap channel-layout">
        <div>
          <div className="section-heading"><div><span className="eyebrow">全部文章</span><h2>从你遇到的问题开始</h2></div></div>
          <div className="card-grid two">{items.map((item) => <ArticleCard item={item} key={item.slug} />)}</div>
        </div>
        <aside className="channel-aside">
          <strong>先看这几篇</strong>
          <ol>{items.slice(0, 5).map((item) => <li key={item.slug}><a href={`/${item.category}/${item.slug}`}>{item.title}</a></li>)}</ol>
        </aside>
      </section>
    </>
  );
}
