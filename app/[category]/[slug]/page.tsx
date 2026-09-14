import type { Metadata } from "next";
import { Fragment } from "react";
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
  const description = item.description.length < 55
    ? `${item.description}下面把常见原因、检查顺序和具体操作一次说清楚，照着做就行。`
    : item.description;
  return {
    title: item.title,
    description,
    alternates: { canonical: `/${item.category}/${item.slug}` },
    openGraph: { type: "article", title: item.title, description, publishedTime: item.date },
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
    author: { "@type": "Organization", name: "有招" },
    mainEntityOfPage: `/${item.category}/${item.slug}`,
  };
  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: item.faqs.map((faq) => ({ "@type": "Question", name: faq.q, acceptedAnswer: { "@type": "Answer", text: faq.a } })) };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <article className="article-page blog-article">
        <header className="article-head wrap article-wrap">
          <div className="breadcrumbs"><a href="/">首页</a><span>/</span><a href={`/${item.category}`}>{category?.name}</a></div>
          <a className="article-category" href={`/${item.category}`}>{category?.name}</a>
          <h1>{item.title}</h1>
          <p className="dek">{item.description}</p>
          <div className="article-meta">{item.date.replaceAll("-", ".")} · 阅读约 {item.deep?.readingMinutes ?? 6} 分钟</div>
        </header>

        <div className="wrap article-layout">
          <div className="article-content">
            <div className="article-opening">
              <p className="lead">{item.answer}</p>
              {!item.deep && <p>先别急着重复操作。这个问题通常可以从几个明确的方向排查，按下面的顺序处理，会比到处试偏方省事。</p>}
            </div>

            {item.deep ? (
              <>
                {item.deep.sections.map((section, sectionIndex) => (
                  <Fragment key={section.title}>
                    <section id={`section-${sectionIndex + 1}`} className="content-section deep-section">
                      <h2>{section.title}</h2>
                      {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                      {section.table && (
                        <div className="article-table-wrap">
                          <table className="article-table">
                            <thead><tr>{section.table.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
                            <tbody>{section.table.rows.map((row) => <tr key={row.join("-")}>{row.map((cell, index) => <td key={`${cell}-${index}`}>{cell}</td>)}</tr>)}</tbody>
                          </table>
                        </div>
                      )}
                      {section.bullets && <ul className="blog-list">{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
                      {section.steps && <ol className="blog-steps">{section.steps.map((step) => <li key={step.title}><h3>{step.title}</h3><p>{step.body}</p></li>)}</ol>}
                      {section.note && <p className="article-note"><strong>提醒：</strong>{section.note}</p>}
                    </section>
                    {sectionIndex === 1 && item.cta && <Cta type={item.cta} source={`${item.category}/${item.slug}`} />}
                  </Fragment>
                ))}
                {item.deep.sources.length > 0 && <section className="content-section article-sources">
                  <h2>参考来源</h2>
                  <p>产品规则和页面入口可能调整，关键限制以官方当前页面为准：</p>
                  <ul>{item.deep.sources.map((source) => <li key={source.href}><a href={source.href} target="_blank" rel="noreferrer">{source.label}</a></li>)}</ul>
                </section>}
              </>
            ) : (
              <>
                <section id="check" className="content-section">
                  <h2>先把这几项对一遍</h2>
                  <p>很多时候不是操作步骤错了，而是前置条件还没有满足。先检查：</p>
                  <ul className="blog-list">{item.checklist.map((check) => <li key={check}>{check}</li>)}</ul>
                </section>

                {item.cta && <Cta type={item.cta} source={`${item.category}/${item.slug}`} />}

                <section id="steps" className="content-section">
                  <h2>具体怎么处理</h2>
                  <ol className="blog-steps">{item.steps.map((step) => <li key={step.title}><h3>{step.title}</h3><p>{step.body}</p></li>)}</ol>
                </section>
              </>
            )}

            <section id="faq" className="content-section">
              <h2>你可能还会问</h2>
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
              {item.deep ? item.deep.sections.slice(0, 4).map((section, index) => <a href={`#section-${index + 1}`} key={section.title}>{section.title}</a>) : <><a href="#check">先检查这些</a><a href="#steps">具体解决步骤</a></>}
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
