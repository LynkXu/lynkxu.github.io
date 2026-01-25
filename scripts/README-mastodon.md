# Mastodon 同步说明

## 功能概述

该脚本可以从 Mastodon 账号自动同步所有公开嘟文到碎碎念页面。

## 使用方法

### 1. 配置环境变量（可选）

在项目根目录的 `.env` 文件中添加以下配置：

```env
MASTODON_INSTANCE=https://mastodon.social
MASTODON_USERNAME=lynkxu
```

如果不配置，将使用默认值。

### 2. 手动同步

```bash
npm run sync:mastodon
```

### 3. 自动同步（构建时）

构建命令已自动集成同步：

```bash
npm run build
```

这将在构建前自动同步 Mastodon 数据。

### 4. 发布嘟文

在 Mastodon 上发布的所有公开嘟文都会自动同步到网站。

## 博客文章自动发布到 Mastodon（部署成功后）

仓库已集成“**新增中文博客文章后，部署成功才发布到 Mastodon**”的流程：

- 工作流：`.github/workflows/astro.yml` 中的 `publish_mastodon` job（`needs: deploy`）
- 发布脚本：`scripts/publish-blog-to-mastodon.mjs`
- 去重状态：`src/data/mastodon-published.json`（用于避免重复发布同一篇文章）

### 需要配置的 Secrets

在 GitHub Repo -> Settings -> Secrets and variables -> Actions 里添加：

- `MASTODON_INSTANCE`：例如 `https://mastodon.social`
- `MASTODON_ACCESS_TOKEN`：用于发布（需要具备 `write:statuses` 权限）

### 如何获取 Access Token（建议做法）

在你的 Mastodon 实例中创建一个应用（App），授权后拿到 access token，权限至少包含：

- `write:statuses`

### 本地调试/手动运行

脚本会根据 git diff 自动识别“新增”的博客 Markdown 文件，并发布：**标题 +（可选）摘要 + 链接**。

```bash
MASTODON_INSTANCE="https://mastodon.social" \
MASTODON_ACCESS_TOKEN="xxxx" \
BASE_SHA="<oldSha>" \
HEAD_SHA="<newSha>" \
node scripts/publish-blog-to-mastodon.mjs
```

可选参数：

- `SITE_URL`：覆盖站点域名（默认从 `astro.config.mjs` 读取 `site`）
- `MASTODON_VISIBILITY`：默认 `public`
- `MASTODON_CHAR_LIMIT`：默认 `500`

## 工作原理

1. **数据获取**：脚本调用 Mastodon 公开 API，无需访问令牌
2. **内容筛选**：获取所有公开嘟文（排除回复和转发）
3. **增量更新**：首次运行会获取所有公开嘟文（最多 200 条），之后只获取新发布的内容
4. **数据存储**：嘟文数据以 JSON 格式存储在 `src/data/mastodon.json`
5. **页面集成**：碎碎念页面会自动合并 Markdown 文件和 Mastodon 数据，并按时间排序

## 同步频率说明

- **手动触发**：运行 `npm run sync:mastodon` 或 `npm run build`
- **构建时同步**：每次构建网站时会自动同步最新数据
- **增量更新**：只获取上次同步后的新嘟文，节省 API 请求
- **CI/CD 集成**：可在 GitHub Actions 等 CI/CD 中配置定时构建实现自动同步

示例 GitHub Actions 定时同步配置：
```yaml
# .github/workflows/sync.yml
name: Sync Mastodon
on:
  schedule:
    - cron: '0 */6 * * *'  # 每 6 小时同步一次
  workflow_dispatch:  # 支持手动触发

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run sync:mastodon
      - run: npm run build
      # 然后部署...
```

## 数据格式

同步后的数据包含：
- `id`：嘟文 ID
- `created_at`：发布时间
- `content_html`：原始 HTML 内容
- `content_markdown`：转换后的 Markdown 内容
- `url`：嘟文链接
- `visibility`：可见性（public/unlisted/private）
- `tags`：话题标签数组
- `media_attachments`：媒体附件（图片、视频等）
- `favourites_count`：点赞数
- `reblogs_count`：转发数
- `replies_count`：回复数

## 技术细节

### API 限制

- Mastodon API 有速率限制（通常 300 请求/5分钟）
- 增量更新策略可避免频繁请求
- 每次请求最多获取 40 条嘟文，最多翻 5 页（共 200 条）

### 内容转换

- HTML 自动转换为 Markdown
- 支持段落、链接、加粗、斜体等基本格式
- 图片和媒体附件链接会保留

### 隐私说明

- 仅能同步公开（public）的嘟文
- 自动排除回复和转发
- 未列出（unlisted）的嘟文也会被同步
- 仅关注者可见和私密嘟文需要 OAuth token，当前未实现

## 故障排查

### 同步不到数据

1. 确认嘟文是公开的（非私密或仅关注者可见）
2. 确认不是回复或转发（脚本会自动排除这些）
3. 检查网络连接
4. 查看控制台输出的错误信息

### 构建失败

1. 检查 `src/data/mastodon.json` 文件是否存在
2. 如果文件不存在，手动创建一个空数组：`[]`
3. 重新运行同步命令

## 后续优化建议

- [ ] 支持下载媒体附件到本地
- [ ] 添加话题标签筛选选项（可选择是否启用）
- [ ] 添加内容缓存机制
- [ ] 支持自定义 HTML 到 Markdown 转换规则
- [ ] 添加 OAuth 支持以同步非公开嘟文
- [ ] 配置 CI/CD 定时自动同步
