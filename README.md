# 有招

面向中文用户的 Apple ID、海外 App、AI 工具、社交平台、Google 服务和苹果礼品卡问题解决博客。

## 本地开发

```bash
npm ci
npm run dev
```

## 构建

```bash
npm run build
```

## GitHub Pages

推送到 `main` 分支后，GitHub Actions 会自动：

1. 构建 vinext 网站；
2. 把全部频道和文章导出成静态 HTML；
3. 调整项目二级路径；
4. 发布到 GitHub Pages。

静态导出目录为 `public-github/`，不会提交进仓库。
