export const articleSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "description", "answer", "readingMinutes", "checklist", "steps", "sections", "faqs"],
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    answer: { type: "string" },
    readingMinutes: { type: "integer" },
    checklist: { type: "array", items: { type: "string" } },
    steps: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "body"],
        properties: { title: { type: "string" }, body: { type: "string" } },
      },
    },
    sections: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "paragraphs", "bullets", "steps", "note"],
        properties: {
          title: { type: "string" },
          paragraphs: { type: "array", items: { type: "string" } },
          bullets: { type: "array", items: { type: "string" } },
          steps: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["title", "body"],
              properties: { title: { type: "string" }, body: { type: "string" } },
            },
          },
          note: { type: "string" },
        },
      },
    },
    faqs: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["q", "a"],
        properties: { q: { type: "string" }, a: { type: "string" } },
      },
    },
  },
};

const bannedPhrases = ["综上所述", "总而言之", "值得注意的是", "在当今数字化时代", "作为一个", "本文旨在", "赋能", "一站式解决方案"];

export function articleText(article) {
  return [
    article.title,
    article.description,
    article.answer,
    ...(article.checklist ?? []),
    ...(article.steps ?? []).flatMap((item) => [item.title, item.body]),
    ...(article.deep?.sections ?? article.sections ?? []).flatMap((section) => [
      section.title,
      ...(section.paragraphs ?? []),
      ...(section.bullets ?? []),
      ...(section.steps ?? []).flatMap((item) => [item.title, item.body]),
      section.note ?? "",
    ]),
    ...(article.faqs ?? []).flatMap((item) => [item.q, item.a]),
  ].join("");
}

export function validateArticle(article, existingKeys = new Set()) {
  const errors = [];
  const key = `${article.category}/${article.slug}`;
  const text = articleText(article);

  if (existingKeys.has(key)) errors.push(`文章地址重复：${key}`);
  if (!/^[a-z0-9-]+$/.test(article.slug ?? "")) errors.push("slug 只能包含小写字母、数字和连字符");
  if ((article.title?.length ?? 0) < 12 || article.title.length > 55) errors.push("标题长度必须在 12 到 55 个字符之间");
  if (!article.title?.toLowerCase().includes(article.keyword.toLowerCase())) errors.push(`标题必须完整包含关键词：${article.keyword}`);
  if ((article.description?.length ?? 0) < 55 || article.description.length > 130) errors.push("description 长度必须在 55 到 130 个字符之间");
  if ((article.answer?.length ?? 0) < 80 || article.answer.length > 260) errors.push("开头直给答案必须在 80 到 260 个字符之间");
  if (text.length < 1600) errors.push(`全文太短：当前 ${text.length} 字，至少 1600 字`);
  if (text.length > 5000) errors.push(`全文太长：当前 ${text.length} 字，最多 5000 字`);
  if ((article.checklist?.length ?? 0) < 5) errors.push("检查清单至少 5 项");
  if ((article.steps?.length ?? 0) < 4) errors.push("首页步骤至少 4 项");
  if ((article.deep?.sections?.length ?? article.sections?.length ?? 0) < 6) errors.push("正文至少 6 个小节");
  if ((article.faqs?.length ?? 0) < 5) errors.push("FAQ 至少 5 个");
  for (const phrase of bannedPhrases) if (text.includes(phrase)) errors.push(`出现官话：${phrase}`);
  if (/保证成功|百分之百|永久有效|绝对安全/.test(text)) errors.push("出现无法保证的绝对说法");
  if (/https?:\/\//.test(text)) errors.push("正文不能生成外链");
  return errors;
}

export function responseText(payload) {
  if (typeof payload.output_text === "string" && payload.output_text) return payload.output_text;
  for (const item of payload.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") return content.text;
    }
  }
  throw new Error("模型返回结果里没有找到正文");
}
