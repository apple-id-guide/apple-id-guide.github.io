export function Cta({ type }: { type?: "apple" | "chatgpt" }) {
  if (!type) return null;
  const apple = type === "apple";
  return (
    <aside className="cta-box">
      <div>
        <span className="eyebrow">省时间的办法</span>
        <h2>{apple ? "自己排查后还是改不了地区？" : "付款一直失败，想换个处理方式？"}</h2>
        <p>{apple ? "先把文章里的余额、订阅和家庭共享查完；确定仍然处理不了，再看自助解决方案。" : "先核对账号和账单资料。仍然无法完成时，可以查看可用的订阅解决方案。"}</p>
      </div>
      <a className="button" href={apple ? "https://idgaiqu.com" : "https://waiquid.com"} target="_blank" rel="noreferrer">
        {apple ? "查看地区修改方案" : "查看订阅解决方案"}
      </a>
    </aside>
  );
}

