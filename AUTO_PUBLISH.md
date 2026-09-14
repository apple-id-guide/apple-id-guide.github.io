# 全自动文章发布

这个项目每天北京时间 09:20 自动完成一次完整发布：从关键词池取出一个没写过的词，调用 DeepSeek 生成文章，检查标题、字数、排版、FAQ 和口语化程度，通过后写入文章库并部署 GitHub Pages。

## 只需设置一次

在 GitHub 仓库打开 `Settings → Secrets and variables → Actions → New repository secret`：

- Name：`DEEPSEEK_API_KEY`
- Secret：可调用 DeepSeek API 的密钥

可选：在 `Variables` 里添加 `DEEPSEEK_MODEL`。未设置时使用 `deepseek-v4-flash`。

## 发布规则

- 每天自动发布 1 篇，不需要人工确认。
- 关键词按 `content/topic-pool.json` 的顺序使用，已存在的文章会自动跳过。词池用完后，会自动读取 Google、Bing、百度搜索联想补充新词；联想接口临时不可用时也会自动补一个未覆盖的长尾问题。
- 文章会进入对应频道、首页文章列表、站内搜索和 sitemap。
- 购买入口继续由站点统一添加：AI 相关跳到 `waiquid.com` 首页，账号和 App 相关按现有规则跳转。
- 任何一项质量检查失败时，最多自动重写 3 次；仍不合格则当天不发布。
- DeepSeek 请求、构建或部署任何一步失败，都不会提交半成品文章。

## 手动立即跑一次

打开仓库的 `Actions → Auto Generate and Publish Article → Run workflow`，可以选择本次生成 1 到 3 篇。

## 暂停

在 GitHub Actions 页面停用 `Auto Generate and Publish Article` 工作流即可。已经发布的文章不会被删除。
