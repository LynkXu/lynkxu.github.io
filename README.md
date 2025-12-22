## LynkXu's Blog

基于 Astro 构建的个人博客 / 个人站点（静态生成），部署在 GitHub Pages。

- **Online**: [lynkxu.github.io](https://lynkxu.github.io)
- **RSS**: [`/index.xml`](https://lynkxu.github.io/index.xml)

## 我在模板基础上做了哪些改造

本项目最初基于博客模板 **`@anghunk/astro-blog`** 改造而来（模板作者站点：[zishu.me](https://zishu.me)）。在保留整体风格的前提下，我主要补齐/增强了以下能力：

### 内容与路由

- **文章链接统一 `.html` 后缀**：文章页路由生成改为 `/blog/<id>.html`，更贴合纯静态托管/历史链接习惯。
- **标签 / 分类页**：基于 frontmatter 的 `tags` / `categories` 自动聚合与计数，并支持按年份归档文章列表。
- **Page 系统增强**：`src/content/page/*.md` 统一走动态路由渲染，并支持 `aliases`（别名路径）与布局映射。
- **碎碎念（Shuoshuo）**：新增 `gossips` 内容集合 + 列表渲染 + 前端分页。
- **工具清单（Tools）**：独立页面展示常用软件/硬件/服务，支持深色模式图标反转与 SimpleIcons CDN 集成。

### 交互与体验

- **全站搜索弹窗**：导航栏按钮 + `Cmd/Ctrl + K` 打开；支持标题/描述/标签/分类检索、关键词高亮与结果统计。
- **返回顶部按钮**：滚动到一定距离自动显示，支持平滑回顶。
- **首页加载遮罩**：仅首页展示，用于改善首次打开的观感。
- **悬浮深浅色切换按钮**：本地持久化主题，避免闪烁。

### 图片与展示

- **LightGallery（本地静态资源）**：文章内容中的图片自动包裹成可点击预览，并支持在页面切换时清理旧实例。
- **LightGallery 资源自动复制脚本**：通过 `npm run copy-lightgallery` 将依赖资源拷贝到 `public/lightgallery/`，避免线上依赖外链。
- **Projects 页面**：从 `projects.json` 驱动项目卡片渲染 + tag 展示，并加入 GitHub Activity 图。
- **摄影集（Photography）**：读取 `src/content/photography/` 下的图片资源，自动生成响应式网格画廊，并复用 LightGallery 进行预览。


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

## Strava 数据定时同步（GitHub Actions）

本仓库支持通过 GitHub Actions **定时拉取 Strava API 活动数据**，生成 `运动主页` 所需的统计 JSON，并自动提交到 `main`，从而触发现有的 Pages 部署工作流发布站点。

### 你需要做的事

#### 1) 创建 Strava API 应用

在 Strava 个人设置里创建 API 应用，拿到：

- `client_id`
- `client_secret`

（回调地址可以先随便填一个你可控的地址，后续用于获取授权 `code`）

#### 2) 获取 refresh token（一次性）

用浏览器打开授权链接（把 `CLIENT_ID` / `REDIRECT_URI` 替换成你的）：

- `https://www.strava.com/oauth/authorize?client_id=CLIENT_ID&response_type=code&redirect_uri=REDIRECT_URI&approval_prompt=force&scope=read,activity:read_all`

授权后，你会被重定向到 `REDIRECT_URI?code=...`，复制其中的 `code`。

然后用 `curl` 交换 token（把 `CLIENT_ID` / `CLIENT_SECRET` / `CODE` 替换成你的）：

```bash
curl -X POST https://www.strava.com/oauth/token \
  -d client_id=CLIENT_ID \
  -d client_secret=CLIENT_SECRET \
  -d code=CODE \
  -d grant_type=authorization_code
```

响应里会有 `refresh_token`（长期有效，用于 Action 定时刷新 access token）。

#### 3) 在 GitHub 仓库设置 Secrets

进入仓库：`Settings → Secrets and variables → Actions`，新增：

- `STRAVA_CLIENT_ID`
- `STRAVA_CLIENT_SECRET`
- `STRAVA_REFRESH_TOKEN`

#### 4) 配置“已有历史数据（基线）”

你提到 **Strava 目前还没有跑步数据**，但页面已经有“总跑量/PR”等历史累计数据。

这些“已有数据”保存在：

- `src/data/strava/baseline.json`

同步脚本会把 **Strava 拉到的跑步里程** 与 **baseline 里已有的里程** 叠加生成最终展示值，因此即使 Strava 跑步为空，页面也会继续显示你的当前数据。

#### 5) 触发同步

工作流文件：

- `.github/workflows/strava-sync.yml`

你可以：

- 在 Actions 里手动运行 `Sync Strava data`
- 或等待定时任务执行

生成结果会写入并提交：

- `src/data/strava/activities.min.json`（活动缓存，增量同步用）
- `src/data/strava/state.json`（上次同步水位）
- `src/data/sports-stats.json`（页面消费的统计结果）

> 站点发布由现有的 `/.github/workflows/astro.yml` 完成（push 到 `main` 自动构建部署）。

### 可选：使用开源库/项目

目前实现是直接调用 Strava REST API（Node 20 自带 `fetch`，不额外引依赖）。如果你更偏好“开箱即用”的封装，可以考虑：

- `strava-v3`（npm 上常用的 Strava API 封装库）

## 目录结构（节选）

| Path | 说明 |
| :-- | :-- |
| `src/content/blog/` | 博客文章（md/mdx） |
| `src/content/page/` | 独立页面内容（About/Projects/Resume/...） |
| `src/content/gossips/` | 碎碎念内容 |
| `src/content/photography/` | 摄影作品图片资源 |
| `src/components/` | 组件（搜索弹窗/评论/目录/返回顶部/加载遮罩等） |
| `src/layouts/` | 布局（BlogPost/Projects/Shuoshuo 等） |
| `src/pages/` | 路由（含 `.html` 文章路由与 RSS） |
| `public/lightgallery/` | LightGallery 本地静态资源 |
| `.github/workflows/astro.yml` | GitHub Pages 部署工作流 |
| `.github/workflows/strava-sync.yml` | 定时同步 Strava 数据并提交的工作流 |

## 致谢

- [Astro](https://astro.build/) - 现代化的 Web 框架
- [Bear Blog](https://github.com/HermanMartinus/bearblog/) - 设计灵感
- [Twikoo](https://twikoo.js.org/) - 评论系统
- `@anghunk/astro-blog` - 初始模板与实现参考

## License

除非另有说明，本仓库/博客内容基于 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh-hans) 协议开源。
