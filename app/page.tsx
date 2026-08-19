import type { Metadata } from "next";
import { ArticleCard } from "../components/article-card";
import { SearchBox } from "../components/search-box";
import { articles, categories, getCategoryArticles, articleHref } from "../lib/content";

export const metadata: Metadata = {
  title: "Apple ID、海外 App 和 AI 工具使用教程",
  description: "Apple ID 改地区、App Store 下载、ChatGPT 订阅、Codex 安装和 Telegram 验证码等常见问题，直接给解决办法。",
};

export default function Home() {
  const hot = articles.filter((item) => item.hot).slice(0, 8);
  const latest = articles.slice(-6).reverse();
  return (
    <>
      <section className="hero">
        <div className="wrap hero-inner">
          <div className="hero-copy">
            <span className="kicker">遇到问题，直接找办法</span>
            <h1>Apple ID、海外 App 和<br />AI 工具使用教程</h1>
            <p>改不了地区、商店搜不到、付款失败、验证码收不到？别急，这里不绕弯子，按问题给你说明白。</p>
          </div>
          <div className="hero-search">
            <SearchBox />
            <div className="quick-links">
              <span>大家在搜</span>
              <a href="/apple-id/change-region">Apple ID 改地区</a>
              <a href="/chatgpt/payment-declined">ChatGPT 付款失败</a>
              <a href="/telegram/code-not-received">Telegram 验证码</a>
            </div>
          </div>
        </div>
      </section>

      <section className="section wrap">
        <div className="section-heading"><div><span className="eyebrow">高频问题</span><h2>最近大家都在解决</h2></div><a href="/search">查看全部文章 →</a></div>
        <div className="card-grid">{hot.map((item) => <ArticleCard item={item} key={item.slug} />)}</div>
      </section>

      <section className="section section-tint">
        <div className="wrap">
          <div className="section-heading"><div><span className="eyebrow">按产品找</span><h2>你现在卡在哪一类问题？</h2></div></div>
          <div className="category-grid">
            {categories.map((category, index) => {
              const items = getCategoryArticles(category.slug).slice(0, 4);
              return (
                <article className={`category-card tone-${index + 1}`} key={category.slug}>
                  <div className="category-number">0{index + 1}</div>
                  <h3><a href={`/${category.slug}`}>{category.name}</a></h3>
                  <p>{category.description}</p>
                  <ul>{items.map((item) => <li key={item.slug}><a href={articleHref(item)}>{item.title.replace(/[？?].*$/, "")}</a></li>)}</ul>
                  <a className="text-link" href={`/${category.slug}`}>进入频道 →</a>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section wrap symptom-section">
        <div><span className="eyebrow">对号入座</span><h2>你现在卡在哪一步？</h2><p>不知道准确关键词也没关系，直接按现象找。</p></div>
        <div className="symptom-grid">
          <a href="/apple-id/cannot-change-region">改不了地区</a>
          <a href="/apple-id/clear-balance">余额清不掉</a>
          <a href="/app-store/not-available-region">商店搜不到 App</a>
          <a href="/chatgpt/payment-declined">付款总被拒绝</a>
          <a href="/telegram/code-not-received">收不到验证码</a>
          <a href="/codex/command-not-found">安装后找不到命令</a>
        </div>
      </section>

      <section className="section dark-section">
        <div className="wrap">
          <div className="section-heading light"><div><span className="eyebrow">新内容入口</span><h2>最近发布</h2></div></div>
          <div className="latest-list">{latest.map((item) => <a href={articleHref(item)} key={item.slug}><small>{getCategoryArticles(item.category).length} 篇 · {item.date}</small><strong>{item.title}</strong><span>→</span></a>)}</div>
        </div>
      </section>
    </>
  );
}
