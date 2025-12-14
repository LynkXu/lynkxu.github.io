## LynkXu's Blog

基于 Astro 构建的个人博客 / 个人站点（静态生成），部署在 GitHub Pages。

- **Online**: [lynkxu.github.io](https://lynkxu.github.io)
- **RSS**: [`/index.xml`](https://lynkxu.github.io/index.xml)

## 我在模板基础上做了哪些改造

本项目最初基于博客模板 **`@anghunk/astro-blog`** 改造而来（模板作者站点：[zishu.me](https://zishu.me)）。在保留整体风格的前提下，我主要补齐/增强了以下能力：

### 内容与路由

- **文章链接统一 `.html` 后缀**：文章页路由生成改为 `/blog/<id>.html`，更贴合纯静态托管/历史链接习惯（见 `src/pages/blog/[...slug].astro`）。
- **标签 / 分类页**：基于 frontmatter 的 `tags` / `categories` 自动聚合与计数，并支持按年份归档文章列表（见 `src/pages/tags/*`、`src/pages/categories/*`、`src/pages/blog/index.astro`）。
- **Page 系统增强**：`src/content/page/*.md` 统一走 `src/pages/[slug].astro` 渲染，并支持 `aliases`（别名路径）与布局映射（`Page/About/Message/Shuoshuo/Projects`）。
- **碎碎念（Shuoshuo）**：新增 `gossips` 内容集合 + 列表渲染 + 前端分页（见 `src/layouts/Shuoshuo.astro`、`src/content/gossips/*`）。

### 交互与体验

- **全站搜索弹窗**：导航栏按钮 + `Cmd/Ctrl + K` 打开；支持标题/描述/标签/分类检索、关键词高亮与结果统计（见 `src/components/SearchModal.astro`、`src/components/Header.astro`）。
- **返回顶部按钮**：滚动到一定距离自动显示，支持平滑回顶（见 `src/components/NavButton.astro`）。
- **首页加载遮罩**：仅首页展示，用于改善首次打开的观感（见 `src/components/Loading.astro`）。
- **悬浮深浅色切换按钮**：本地持久化主题，避免闪烁（见 `src/layouts/Base.astro`、`src/components/BaseHead.astro`）。

### 图片与展示

- **LightGallery（本地静态资源）**：文章内容中的图片自动包裹成可点击预览，并支持在页面切换时清理旧实例（见 `src/layouts/BlogPost.astro`）。
- **LightGallery 资源自动复制脚本**：通过 `npm run copy-lightgallery` 将依赖资源拷贝到 `public/lightgallery/`，避免线上依赖外链（见 `scripts/copy-lightgallery.js`）。
- **Projects 页面**：从 `projects.json` 驱动项目卡片渲染 + tag 展示，并加入 GitHub Activity 图（见 `src/layouts/Projects.astro`、`src/content/page/projects.json`）。


## 开发

### 环境

- **Node.js**: 建议 `>= 20`

### 常用命令

| Command | Action |
| :-- | :-- |
| `npm install` | 安装依赖 |
| `npm run dev` | 本地开发（默认 `localhost:4321`） |
| `npm run build` | 构建到 `./dist/` |
| `npm run preview` | 预览本地构建 |
| `npm run copy-lightgallery` | 复制 LightGallery 静态资源到 `public/` |

## 目录结构（节选）

| Path | 说明 |
| :-- | :-- |
| `src/content/blog/` | 博客文章（md/mdx） |
| `src/content/page/` | 独立页面内容（About/Projects/Resume/...） |
| `src/content/gossips/` | 碎碎念内容 |
| `src/components/` | 组件（搜索弹窗/评论/目录/返回顶部/加载遮罩等） |
| `src/layouts/` | 布局（BlogPost/Projects/Shuoshuo 等） |
| `src/pages/` | 路由（含 `.html` 文章路由与 RSS） |
| `public/lightgallery/` | LightGallery 本地静态资源 |
| `.github/workflows/astro.yml` | GitHub Pages 部署工作流 |

## 致谢

- [Astro](https://astro.build/) - 现代化的 Web 框架
- [Bear Blog](https://github.com/HermanMartinus/bearblog/) - 设计灵感
- [Twikoo](https://twikoo.js.org/) - 评论系统
- `@anghunk/astro-blog` - 初始模板与实现参考

## License

除非另有说明，本仓库/博客内容基于 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh-hans) 协议开源。
