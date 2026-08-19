import type { Metadata } from "next";
import { ArticleCard } from "../../../components/article-card";
import { Cta } from "../../../components/cta";
import { articles, getArticle, getCategory, relatedArticles } from "../../../lib/content";

export async function generateStaticParams() {
  return articles.map((item) => ({ category: item.category, slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string; slug: string }> }): Promise<Metadata> {
  const route = await params;
  const item = getArticle(route.category, route.slug);
  if (!item) return { title: "文章不存在" };
  return {
    title: item.title,
    description: item.description,
    alternates: { canonical: `/${item.category}/${item.slug}` },
    openGraph: { type: "article", title: item.title, description: item.description, publishedTime: item.date },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const route = await params;
  const item = getArticle(route.category, route.slug);
  if (!item) return <div className="wrap empty-state"><h1>文章不存在</h1><a href="/">返回首页</a></div>;
  const category = getCategory(item.category);
  const related = relatedArticles(item);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: item.title,
    description: item.description,
    datePublished: item.date,
    dateModified: item.date,
    author: { "@type": "Organization", name: "有招指南" },
    mainEntityOfPage: `/${item.category}/${item.slug}`,
  };
  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: item.faqs.map((faq) => ({ "@type": "Question", name: faq.q, acceptedAnswer: { "@type": "Answer", text: faq.a } })) };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <article className="article-page">
        <header className="article-head wrap article-wrap">
          <div className="breadcrumbs"><a href="/">首页</a><span>/</span><a href={`/${item.category}`}>{category?.name}</a></div>
          <span className="kicker">{category?.name} · 解决办法</span>
          <h1>{item.title}</h1>
          <p className="dek">{item.description}</p>
          <div className="article-meta">更新于 {item.date.replaceAll("-", ".")}</div>
        </header>

        <div className="wrap article-layout">
          <div className="article-content">
            <section className="answer-box">
              <span>先说结论</span>
              <p>{item.answer}</p>
            </section>

            <nav className="toc" aria-label="文章目录">
              <strong>这篇文章讲什么</strong>
              <a href="#check">先检查这些</a>
              <a href="#steps">具体怎么处理</a>
              <a href="#faq">常见问题</a>
            </nav>

            <section id="check" className="content-section">
              <span className="section-index">01</span>
              <h2>先检查这些，别急着反复操作</h2>
              <p>先把下面几项对一遍。很多问题不是操作步骤错了，而是前置条件还没有满足。</p>
              <ul className="check-list">{item.checklist.map((check) => <li key={check}>{check}</li>)}</ul>
            </section>

            <section id="steps" className="content-section">
              <span className="section-index">02</span>
              <h2>具体怎么处理</h2>
              <div className="steps">{item.steps.map((step, index) => <div className="step" key={step.title}><span>{index + 1}</span><div><h3>{step.title}</h3><p>{step.body}</p></div></div>)}</div>
            </section>

            {item.cta && <Cta type={item.cta} />}

            <section id="faq" className="content-section">
              <span className="section-index">03</span>
              <h2>常见问题</h2>
              <div className="faq-list">{item.faqs.map((faq) => <details key={faq.q}><summary>{faq.q}</summary><p>{faq.a}</p></details>)}</div>
            </section>

            <section className="related-section">
              <span className="eyebrow">接着看</span>
              <h2>相关问题</h2>
              <div className="related-grid">{related.map((relatedItem) => <ArticleCard item={relatedItem} compact key={`${relatedItem.category}-${relatedItem.slug}`} />)}</div>
            </section>
          </div>
          <aside className="article-aside">
            <div className="sticky-box">
              <strong>快速跳转</strong>
              <a href="#check">先检查这些</a>
              <a href="#steps">具体解决步骤</a>
              <a href="#faq">常见问题</a>
              <hr />
              <a href={`/${item.category}`}>更多{category?.name}问题 →</a>
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}
