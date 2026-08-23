import { spawn } from "node:child_process";
import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { articles, categories } from "../lib/content.ts";

const port = Number(process.env.EXPORT_PORT ?? 4173);
const origin = `http://127.0.0.1:${port}`;
const basePath = normalizeBase(process.env.GITHUB_PAGES_BASE ?? "/youzhao-guide");
const siteUrl = (process.env.SITE_URL ?? `https://gudanxn.github.io${basePath}`).replace(/\/$/, "");
const outputDir = path.resolve("public-github");

const pageRoutes = [
  "/",
  "/about",
  "/disclaimer",
  "/privacy",
  "/search",
  ...categories.map((item) => `/${item.slug}`),
  ...articles.map((item) => `/${item.category}/${item.slug}`),
];

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
await cp(path.resolve("dist/client"), outputDir, { recursive: true });

const server = spawn(path.resolve("node_modules/.bin/vinext"), ["start"], {
  env: { ...process.env, PORT: String(port) },
  stdio: "ignore",
});

try {
  await waitForServer();
  for (const route of pageRoutes) {
    const response = await fetch(`${origin}${route}`);
    if (!response.ok) throw new Error(`${route} returned ${response.status}`);
    const source = await response.text();
    const html = makeStaticHtml(source, route);
    const file = route === "/" ? path.join(outputDir, "index.html") : path.join(outputDir, route.slice(1), "index.html");
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, html);
  }

  const searchableRoutes = pageRoutes.filter((route) => route !== "/search");
  const sitemap = [
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
    "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">",
    ...searchableRoutes.map((route) => `  <url><loc>${escapeXml(`${siteUrl}${route === "/" ? "/" : `${route}/`}`)}</loc></url>`),
    "</urlset>",
  ].join("\n");
  await writeFile(path.join(outputDir, "sitemap.xml"), sitemap);
  await writeFile(path.join(outputDir, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: ${basePath}/search/\nSitemap: ${siteUrl}/sitemap.xml\n`);
  await writeFile(path.join(outputDir, ".nojekyll"), "");
  await writeFile(path.join(outputDir, "404.html"), makeNotFoundHtml());
  console.log(`Exported ${pageRoutes.length} pages to ${outputDir}`);
} finally {
  server.kill("SIGTERM");
}

function normalizeBase(value) {
  if (!value || value === "/") return "";
  return `/${value.replace(/^\/+|\/+$/g, "")}`;
}

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(origin);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Production server did not start within 30 seconds.");
}

function makeStaticHtml(source, route) {
  let html = source
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<link\b(?=[^>]*\brel=[\"']modulepreload[\"'])[^>]*>/gi, "")
    .replace(/\sdata-rsc-css-href=[\"'][^\"']*[\"']/gi, "")
    .replaceAll("https://youzhao-guide.hotbirdnet.chatgpt.site", siteUrl)
    .replace(/(href|src)=([\"'])\/(?!\/)/g, `$1=$2${basePath}/`);

  if (route === "/search") {
    html = html.replace("</body>", `${searchScript()}</body>`);
  }
  return html;
}

function searchScript() {
  return `<script>
(() => {
  const input = document.querySelector('.search-page input');
  const panel = document.querySelector('.search-page .search-results');
  if (!input || !panel) return;
  const items = Array.from(panel.querySelectorAll(':scope > a'));
  const empty = document.createElement('p');
  empty.textContent = '没找到完全对应的文章，换个短一点的关键词试试。';
  empty.hidden = true;
  panel.appendChild(empty);
  const update = () => {
    const query = input.value.trim().toLowerCase();
    let visible = 0;
    for (const item of items) {
      const show = !query || item.textContent.toLowerCase().includes(query);
      item.hidden = !show;
      if (show) visible += 1;
    }
    empty.hidden = visible !== 0;
  };
  input.addEventListener('input', update);
  update();
})();
</script>`;
}

function makeNotFoundHtml() {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>页面不存在 - 有招</title><style>body{margin:0;background:#f7f4ec;color:#173b35;font-family:system-ui,sans-serif}.box{max-width:680px;margin:15vh auto;padding:32px}h1{font-size:42px}p{color:#53625e;line-height:1.8}a{display:inline-block;margin-top:16px;color:#087f6a;font-weight:700}</style></head><body><main class="box"><h1>这个页面不存在</h1><p>可能是地址写错了，或者文章已经调整。</p><a href="${basePath}/">返回有招首页</a></main></body></html>`;
}

function escapeXml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}
