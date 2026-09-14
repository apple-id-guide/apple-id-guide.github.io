import { readFile, writeFile } from "node:fs/promises";
import { articles } from "../lib/content.ts";
import { articleSchema, responseText, validateArticle } from "./article-generator-lib.mjs";

const generatedPath = new URL("../content/generated-articles.json", import.meta.url);
const topicsPath = new URL("../content/topic-pool.json", import.meta.url);
const generated = JSON.parse(await readFile(generatedPath, "utf8"));
const topics = JSON.parse(await readFile(topicsPath, "utf8"));
const args = process.argv.slice(2);

if (args.includes("--validate-only")) {
  const errors = validateCollection(generated);
  if (errors.length) throw new Error(errors.join("\n"));
  console.log(`已检查 ${generated.length} 篇自动文章，全部合格。`);
  process.exit(0);
}

const apiKey = process.env.DEEPSEEK_API_KEY;
if (!apiKey) throw new Error("缺少 DEEPSEEK_API_KEY，无法自动生成文章。请把它添加到 GitHub Actions Secrets。 ");

const countIndex = args.indexOf("--count");
const requestedCount = countIndex >= 0 ? Number(args[countIndex + 1]) : 1;
const count = Number.isInteger(requestedCount) ? Math.min(Math.max(requestedCount, 1), 3) : 1;
const usedKeys = new Set(articles.map((item) => `${item.category}/${item.slug}`));
let available = topics.filter((item) => !usedKeys.has(`${item.category}/${item.slug}`));
let topicsChanged = false;
if (available.length < count) {
  while (available.length < count) {
    const discovered = await discoverTopic(new Set([...usedKeys, ...available.map((item) => `${item.category}/${item.slug}`)]));
    topics.push(discovered);
    available.push(discovered);
    topicsChanged = true;
    console.log(`自动补充关键词：${discovered.keyword}`);
  }
}

const selected = available.slice(0, count);
for (const topic of selected) {
  const article = await generateWithRetries(topic, usedKeys);
  generated.unshift(article);
  usedKeys.add(`${article.category}/${article.slug}`);
  console.log(`已生成：${article.title}（${article.category}/${article.slug}）`);
}

const collectionErrors = validateCollection(generated);
if (collectionErrors.length) throw new Error(collectionErrors.join("\n"));
await writeFile(generatedPath, `${JSON.stringify(generated, null, 2)}\n`);
if (topicsChanged) await writeFile(topicsPath, `${JSON.stringify(topics, null, 2)}\n`);

async function generateWithRetries(topic, existingKeys) {
  let lastErrors = [];
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const draft = await requestArticle(topic, lastErrors);
    const article = finalizeArticle(topic, draft);
    const errors = validateArticle({ ...article, keyword: topic.keyword }, existingKeys);
    if (!errors.length) return article;
    lastErrors = errors;
    console.warn(`第 ${attempt} 次生成未通过：${errors.join("；")}`);
  }
  throw new Error(`连续 3 次生成都未通过质量检查：${lastErrors.join("；")}`);
}

async function requestArticle(topic, previousErrors) {
  const prompt = `你在给一个以中文搜索流量为第一目标的实用教程博客写文章。\n\n核心关键词：${topic.keyword}\n搜索意图：${topic.intent}\n频道：${topic.category}\n\n写作要求：\n1. 标题必须原样包含“${topic.keyword}”，先说用户问题，再说能解决什么；不要标题党。\n2. 全文写 1800 到 2600 个中文字符，像懂行的朋友在解释，短句、直白、接地气，不写公文和空话。\n3. 开头 120 字左右直接给答案，让搜索用户马上知道该怎么做。\n4. 围绕一个搜索意图写透，给出明确步骤、常见错误、避坑方法和 5 个真实长尾问答。\n5. 不编造价格、时效、官方规则或成功率；会变化的内容明确写“以当前页面显示为准”。\n6. 不生成网址、不提本站、不硬塞购买广告，购买按钮由网站自动添加。\n7. 每个正文小节至少有两段有实际信息的文字；bullets 或 steps 可以为空数组，但 sections 必须正好 6 个。\n8. 禁止这些套话：综上所述、总而言之、值得注意的是、在当今数字化时代、本文旨在、赋能、一站式解决方案。\n${previousErrors.length ? `上一次没过检查，必须修正：${previousErrors.join("；")}` : ""}`;

  const response = await fetch("https://api.deepseek.com/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash",
      instructions: "只输出符合 JSON Schema 的中文文章。不要解释写作过程。",
      input: prompt,
      store: false,
      max_output_tokens: 9000,
      text: { format: { type: "json_schema", name: "traffic_article", strict: true, schema: articleSchema } },
    }),
  });

  const payload = await response.json();
  if (!response.ok) throw new Error(`DeepSeek API 请求失败（${response.status}）：${payload.error?.message ?? "未知错误"}`);
  return JSON.parse(responseText(payload));
}

async function discoverTopic(existingKeys) {
  const suggestions = await collectSearchSuggestions();
  const categoryValues = ["apple-id", "app-store", "chatgpt", "codex", "telegram", "twitter", "instagram", "tiktok", "gmail", "youtube", "apple-gift-card"];
  const ctaValues = ["region-switch", "app-access", "ai-market", "social-account", "google-account", "gift-card"];
  const schema = {
    type: "object",
    additionalProperties: false,
    required: ["category", "slug", "keyword", "intent", "cta"],
    properties: {
      category: { type: "string", enum: categoryValues },
      slug: { type: "string" },
      keyword: { type: "string" },
      intent: { type: "string" },
      cta: { type: "string", enum: ctaValues },
    },
  };
  const existing = [...existingKeys].slice(-120).join("、");
  const candidateText = suggestions.length ? suggestions.join("\n") : "搜索联想暂时不可用，请根据频道和未覆盖问题补一个高意图长尾词。";
  const response = await fetch("https://api.deepseek.com/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash",
      instructions: "只输出符合 JSON Schema 的选题。",
      input: `从下面的 Google、Bing、百度搜索联想中，挑一个最适合中文实用教程博客、问题明确、能带来购买或注册意图流量的长尾关键词。不要选新闻、灰产、破解、绕过验证或站内已经写过的题目。slug 用简短英文小写和连字符。\n\n搜索联想：\n${candidateText}\n\n站内已有地址：\n${existing}`,
      store: false,
      max_output_tokens: 1200,
      text: { format: { type: "json_schema", name: "traffic_topic", strict: true, schema } },
    }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(`自动补关键词失败（${response.status}）：${payload.error?.message ?? "未知错误"}`);
  const topic = JSON.parse(responseText(payload));
  const key = `${topic.category}/${topic.slug}`;
  if (existingKeys.has(key) || !/^[a-z0-9-]+$/.test(topic.slug) || topic.keyword.length < 5) {
    throw new Error(`自动补充的关键词不合格：${key}`);
  }
  return topic;
}

async function collectSearchSuggestions() {
  const seeds = ["Apple ID", "App Store", "ChatGPT Plus", "Codex", "Telegram", "Twitter", "Instagram", "TikTok", "Gmail", "YouTube Premium", "苹果礼品卡"];
  const seed = seeds[Math.floor(Date.now() / 86400000) % seeds.length];
  const queries = [`${seed} 怎么`, `${seed} 无法`, `${seed} 购买`, `${seed} 验证码`];
  const found = new Set();
  for (const query of queries) {
    const encoded = encodeURIComponent(query);
    const requestOptions = { signal: AbortSignal.timeout(10000) };
    const requests = [
      fetch(`https://suggestqueries.google.com/complete/search?client=firefox&hl=zh-CN&q=${encoded}`, requestOptions).then((response) => response.json()).then((data) => data[1] ?? []),
      fetch(`https://api.bing.com/osjson.aspx?query=${encoded}`, requestOptions).then((response) => response.json()).then((data) => data[1] ?? []),
      fetch(`https://suggestion.baidu.com/su?wd=${encoded}&cb=codex`, requestOptions).then((response) => response.arrayBuffer()).then((buffer) => {
        const body = new TextDecoder("gbk").decode(buffer);
        const match = body.match(/s:\s*(\[[\s\S]*\])\s*}/);
        return match ? JSON.parse(match[1]) : [];
      }),
    ];
    const results = await Promise.allSettled(requests);
    for (const result of results) if (result.status === "fulfilled") for (const item of result.value) if (typeof item === "string") found.add(item.trim());
  }
  return [...found].filter(Boolean).slice(0, 60);
}

function finalizeArticle(topic, draft) {
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return {
    category: topic.category,
    slug: topic.slug,
    title: draft.title,
    description: draft.description,
    answer: draft.answer,
    date,
    checklist: draft.checklist,
    steps: draft.steps,
    faqs: draft.faqs,
    cta: topic.cta,
    deep: {
      title: draft.title,
      description: draft.description,
      answer: draft.answer,
      readingMinutes: Math.max(6, Math.min(Number(draft.readingMinutes) || 10, 20)),
      sections: draft.sections.map((section) => ({
        title: section.title,
        ...(section.paragraphs.length ? { paragraphs: section.paragraphs } : {}),
        ...(section.bullets.length ? { bullets: section.bullets } : {}),
        ...(section.steps.length ? { steps: section.steps } : {}),
        ...(section.note ? { note: section.note } : {}),
      })),
      faqs: draft.faqs,
      sources: [],
    },
  };
}

function validateCollection(items) {
  const errors = [];
  const generatedKeys = new Set(generated.map((item) => `${item.category}/${item.slug}`));
  const seen = new Set(
    articles
      .map((item) => `${item.category}/${item.slug}`)
      .filter((key) => !generatedKeys.has(key)),
  );
  for (const item of items) {
    const topic = topics.find((candidate) => candidate.category === item.category && candidate.slug === item.slug);
    if (!topic) {
      errors.push(`自动文章不在关键词池中：${item.category}/${item.slug}`);
      continue;
    }
    const itemErrors = validateArticle({ ...item, keyword: topic.keyword }, seen);
    errors.push(...itemErrors.map((error) => `${item.category}/${item.slug}: ${error}`));
    seen.add(`${item.category}/${item.slug}`);
  }
  return errors;
}
