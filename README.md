# LynkXu's Blog

基于 Astro 构建的个人博客与个人站点，部署在 GitHub Pages。

- Online: [lynkxu.github.io](https://lynkxu.github.io)
- RSS: [index.xml](https://lynkxu.github.io/index.xml)

## 主要内容

- 博客文章归档与标签页
- About / Memos / Guestbook / Sports 等独立页面
- Media / Photography / Travel / Tools 等专题页
- 基于 Mastodon、NeoDB、Strava 的同步内容

## 开发

- Node.js: `>= 20`

| Command | Action |
| :-- | :-- |
| `npm install` | 安装依赖 |
| `npm run dev` | 本地开发 |
| `npm run build` | 同步数据并构建静态站点 |
| `npm run preview` | 预览构建产物 |
| `npm run copy-lightgallery` | 复制 LightGallery 静态资源 |

## 目录

| Path | 说明 |
| :-- | :-- |
| `src/content/blog/` | 博客文章 |
| `src/content/page/` | 独立页面内容 |
| `src/content/gossips/` | Memos 内容 |
| `src/content/photography/` | 摄影图片资源 |
| `src/components/` | 站点组件 |
| `src/layouts/` | 页面布局 |
| `src/pages/` | 路由与静态页面 |
| `src/data/` | 同步后的内容数据 |
| `public/lightgallery/` | 图片预览依赖资源 |
| `scripts/` | 数据同步与辅助脚本 |

## License

除非另有说明，本仓库/博客内容基于 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh-hans) 协议开源。
