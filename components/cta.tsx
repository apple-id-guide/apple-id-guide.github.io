import type { PromotionType } from "../lib/content";

type Offer = {
  eyebrow: string;
  title: string;
  body: string;
  href: "https://idgaiqu.com" | "https://waiquid.com";
  label: string;
  secondary?: {
    href: "https://idgaiqu.com" | "https://waiquid.com";
    label: string;
  };
};

const offers: Record<PromotionType, Offer> = {
  "region-switch": {
    eyebrow: "不想继续手动折腾",
    title: "前置条件都处理完了，还卡在改区这一步？",
    body: "如果要保留自己的 Apple ID，可以了解自动改区方案。余额、订阅和家庭共享仍要先按本文处理好。",
    href: "https://idgaiqu.com",
    label: "看看自动改区方案",
  },
  "app-access": {
    eyebrow: "还有两种省事办法",
    title: "确认是商店地区问题，不必一直重复搜索",
    body: "想继续使用本人账号，可以处理 App Store 地区；只想单独下载外区应用，也可以另备一个外区账号。",
    href: "https://idgaiqu.com",
    label: "用本人账号改区",
    secondary: { href: "https://waiquid.com", label: "看看外区账号" },
  },
  "ai-market": {
    eyebrow: "自己付款仍然没走通",
    title: "也可以看看其他 AI 会员和账号方案",
    body: "先把扣款状态、账号和账单资料查清，避免重复付款。确实需要替代方案时，再按自己的用途选择。",
    href: "https://waiquid.com",
    label: "看看可用方案",
  },
  "social-account": {
    eyebrow: "注册或验证一直卡住",
    title: "暂时解决不了，也可以了解现成账号方案",
    body: "优先按本文找回或注册自己的账号。仍然需要新账号时，购买前看清使用说明、售后期限，并及时完善安全资料。",
    href: "https://waiquid.com",
    label: "看看账号方案",
  },
  "google-account": {
    eyebrow: "手机号验证一直过不去",
    title: "需要新的 Google 账号，也可以换一种处理方式",
    body: "先按本文排除号码格式、使用次数和短信延迟。仍然无法创建时，再了解其他账号方案。",
    href: "https://waiquid.com",
    label: "看看 Google 账号方案",
  },
  "gift-card": {
    eyebrow: "准备给外区账号充值",
    title: "地区已经确认一致，再选择对应礼品卡",
    body: "礼品卡和 Apple ID 商店地区必须匹配。先确认地区和币种，再查看可用面额，不要把完整卡密发给陌生人。",
    href: "https://waiquid.com",
    label: "看看苹果礼品卡",
  },
};

function trackedUrl(destination: Offer["href"], source: string) {
  const url = new URL(destination);
  url.searchParams.set("utm_source", "youzhao");
  url.searchParams.set("utm_medium", "content");
  url.searchParams.set("utm_campaign", source.replace("/", "-"));
  return url.toString();
}

export function Cta({ type, source }: { type?: PromotionType; source: string }) {
  if (!type) return null;
  const offer = offers[type];
  return (
    <aside className="cta-box">
      <div>
        <span className="eyebrow">{offer.eyebrow}</span>
        <h2>{offer.title}</h2>
        <p>{offer.body}</p>
      </div>
      <div className="cta-actions">
        <a className="button" href={trackedUrl(offer.href, source)} target="_blank" rel="sponsored noreferrer">
          {offer.label}
        </a>
        {offer.secondary && (
          <a className="button button-secondary" href={trackedUrl(offer.secondary.href, source)} target="_blank" rel="sponsored noreferrer">
            {offer.secondary.label}
          </a>
        )}
      </div>
    </aside>
  );
}
