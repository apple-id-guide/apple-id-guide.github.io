import assert from "node:assert/strict";
import test from "node:test";
import { articleText, responseText, validateArticle } from "../scripts/article-generator-lib.mjs";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the traffic blog homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Apple ID、海外 App 和 AI 工具使用教程 - 有招<\/title>/);
  assert.match(html, /Apple ID、海外 App 和<br\/>AI 工具使用教程/);
  for (const channel of ["telegram", "twitter", "instagram", "tiktok", "gmail", "youtube", "apple-gift-card"]) {
    assert.match(html, new RegExp(`href="/${channel}"`));
  }
});

test("server-renders an article with conversion link", async () => {
  const response = await render("/chatgpt/plus-subscribe");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /ChatGPT Plus 怎么购买/);
  assert.match(html, /去购买/);
  assert.match(html, /https:\/\/waiquid\.com\/?\?utm_source=apple-id-guide/);
});

test("automatic article validation rejects thin or official-sounding copy", () => {
  const article = {
    category: "chatgpt",
    slug: "thin-copy",
    keyword: "ChatGPT Plus 购买",
    title: "ChatGPT Plus 购买方法和注意事项",
    description: "太短",
    answer: "综上所述，这是一段太短的答案。",
    checklist: [],
    steps: [],
    sections: [],
    faqs: [],
  };
  const errors = validateArticle(article);
  assert.ok(errors.length >= 6);
  assert.ok(errors.some((error) => error.includes("官话")));
  assert.ok(articleText(article).includes("综上所述"));
});

test("extracts structured response text from the DeepSeek Responses API payload", () => {
  const json = '{"title":"测试"}';
  assert.equal(responseText({ output: [{ content: [{ type: "output_text", text: json }] }] }), json);
});
