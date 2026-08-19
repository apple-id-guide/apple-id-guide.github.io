import { categories } from "../lib/content";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <a className="brand" href="/" aria-label="有招首页">
          <span className="brand-mark">有招</span>
        </a>
        <nav className="nav" aria-label="主导航">
          {categories.filter((category) => ["apple-id", "app-store", "chatgpt", "telegram", "twitter", "gmail", "apple-gift-card"].includes(category.slug)).map((category) => (
            <a key={category.slug} href={`/${category.slug}`}>{category.name}</a>
          ))}
        </nav>
        <a className="search-link" href="/search" aria-label="搜索文章">搜索</a>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div>
          <a className="footer-brand" href="/">有招</a>
          <p>Apple ID、海外 App、AI 工具和 Google 服务，遇到问题直接找办法。</p>
        </div>
        <div>
          <h2>常用频道</h2>
          {categories.map((category) => <a key={category.slug} href={`/${category.slug}`}>{category.name}</a>)}
        </div>
        <div>
          <h2>网站信息</h2>
          <a href="/about">关于本站</a>
          <a href="/privacy">隐私政策</a>
          <a href="/disclaimer">免责声明</a>
          <a href="/sitemap.xml">网站地图</a>
        </div>
      </div>
      <div className="wrap copyright">© 2026 有招 · 产品名称与商标归各自权利人所有</div>
    </footer>
  );
}
