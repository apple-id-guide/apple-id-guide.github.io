import type { PromotionType } from "../lib/content";

type Link = {
  href: "https://idgaiqu.com" | "https://waiquid.com";
  label: string;
  content: string;
  secondary?: boolean;
};

type Offer = { eyebrow: string; title: string; body: string; links: Link[] };

const socialNames: Record<string, string> = {
  telegram: "Telegram 账号",
  twitter: "Twitter / X 账号",
  instagram: "Instagram 账号",
  tiktok: "TikTok 账号",
};

function offerFor(type: PromotionType, source: string): Offer {
  const category = source.split("/")[0];
  if (type === "region-switch") return {
    eyebrow: "自己改区一直失败？",
    title: "不想继续折腾，可以直接用改区工具",
    body: "先按上面把余额、订阅和家庭共享处理好，再去 ID 改区助手操作自己的 Apple ID。",
    links: [{ href: "https://idgaiqu.com", label: "去处理 Apple ID 改区", content: "apple-id-region-switch" }],
  };
  if (type === "app-access") return {
    eyebrow: "只想下载外区 App？",
    title: "不一定非要反复折腾自己的 Apple ID",
    body: "想继续用自己的账号，就去处理 Apple ID 改区；只想下载外区 App，可以直接买一个对应地区的 Apple ID。",
    links: [
      { href: "https://idgaiqu.com", label: "去处理 Apple ID 改区", content: "apple-id-region-switch" },
      { href: "https://waiquid.com", label: "去购买外区 Apple ID", content: "foreign-apple-id", secondary: true },
    ],
  };
  if (type === "ai-market") return {
    eyebrow: "订阅和付款还是卡住？",
    title: "不想自己折腾，可以直接买 AI 会员",
    body: "WaiQuid 有 ChatGPT 等 AI 会员和账号。下单前先看清交付方式、使用说明和售后时间。",
    links: [{ href: "https://waiquid.com", label: "去购买 ChatGPT 等 AI 会员", content: "ai-membership" }],
  };
  if (type === "social-account") {
    const product = socialNames[category] ?? "海外社交账号";
    return {
      eyebrow: "注册半天还是不行？",
      title: `也可以直接买一个 ${product}`,
      body: `WaiQuid 有 ${product}。购买前看清账号类型和售后时间，拿到账号后及时改掉能修改的安全资料。`,
      links: [{ href: "https://waiquid.com", label: `去购买 ${product}`, content: category || "social-account" }],
    };
  }
  if (type === "google-account") return {
    eyebrow: "Google 账号一直注册不下来？",
    title: "不想反复收验证码，可以直接买 Google 邮箱账号",
    body: "WaiQuid 有 Google 邮箱账号。下单前看清是否带恢复资料、怎么登录和售后时间。",
    links: [{ href: "https://waiquid.com", label: "去购买 Google 邮箱账号", content: "google-account" }],
  };
  return {
    eyebrow: "礼品卡地区确认好了？",
    title: "选对地区和面额，就可以直接购买",
    body: "WaiQuid 有美国、香港、日本等地区的苹果礼品卡。卡的地区必须和 Apple ID 地区一致，买错地区不能直接兑换。",
    links: [{ href: "https://waiquid.com", label: "去购买苹果礼品卡", content: "apple-gift-card" }],
  };
}

function trackedUrl(destination: Link["href"], source: string, content: string) {
  const url = new URL(destination);
  url.searchParams.set("utm_source", "apple-id-guide");
  url.searchParams.set("utm_medium", "content");
  url.searchParams.set("utm_campaign", source.replace("/", "-"));
  url.searchParams.set("utm_content", content);
  return url.toString();
}

export function Cta({ type, source }: { type?: PromotionType; source: string }) {
  if (!type) return null;
  const offer = offerFor(type, source);
  return (
    <aside className="cta-box">
      <div>
        <span className="eyebrow">{offer.eyebrow}</span>
        <h2>{offer.title}</h2>
        <p>{offer.body}</p>
      </div>
      <div className="cta-actions">
        {offer.links.map((link) => (
          <a className={`button${link.secondary ? " button-secondary" : ""}`} href={trackedUrl(link.href, source, link.content)} target="_blank" rel="sponsored noreferrer" key={`${link.href}-${link.content}`}>
            {link.label}
          </a>
        ))}
      </div>
    </aside>
  );
}

export function PurchaseLinks({ source = "home" }: { source?: string }) {
  const products = [
    ["去购买外区 Apple ID", "foreign-apple-id"],
    ["去购买海外社交账号", "social-account"],
    ["去购买 Google 邮箱账号", "google-account"],
    ["去购买 ChatGPT 等 AI 会员", "ai-membership"],
    ["去购买苹果礼品卡", "apple-gift-card"],
  ];
  return (
    <aside className="cta-box purchase-box">
      <div>
        <span className="eyebrow">不想自己折腾</span>
        <h2>需要账号、AI 会员或礼品卡，可以直接买</h2>
        <p>按自己需要的类型下单。付款前先看清商品说明、交付方式和售后时间。</p>
      </div>
      <div className="purchase-links">
        {products.map(([label, content]) => (
          <a className="button" href={trackedUrl("https://waiquid.com", source, content)} target="_blank" rel="sponsored noreferrer" key={content}>{label}</a>
        ))}
      </div>
    </aside>
  );
}
