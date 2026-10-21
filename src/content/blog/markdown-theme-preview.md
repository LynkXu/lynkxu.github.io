---
title: 让文字安静地被阅读
slug: markdown-theme-preview
pubDate: 2026-10-21
draft: true
tags: [排版]
---
一套好的阅读主题，应当让内容自然展开。字体、留白与颜色共同建立节奏，让每一次停顿都有恰当的位置。

## 阅读，从清晰的层次开始

标题帮助我们找到方向，段落承接**完整的思考**。保留纸面的轻盈，也为重要的内容留下一点茶绿色。English text and 中文混排，保持原有的阅读节奏。

### 留白也是内容的一部分

- 段落之间，保持稳定的呼吸感。
- 标题之前，留出清晰的章节距离。
  - 嵌套内容应当属于上一条信息。
  - 不因层级增加而产生过多留白。
- 辅助信息退后一步，让正文成为主角。

> 设计的细节，应当被感受到，而不必被注意到。
>
> 多段引用依然需要清晰的内部节奏。

## 当一个章节的标题很长，需要在移动端换行时，底色也应当自然地跟随每一行文字
### 连续标题保持适度距离

从字体、行距到颜色变量，细节应当服务于内容本身。通过 `--space-md` 保持节奏；也可以阅读[关于页面](/about)，或用 <kbd>⌘</kbd> + <kbd>K</kbd> 搜索。

```css
.prose {
  font-family: var(--serif-font);
  line-height: 1.82;
  color: var(--text-color);
}
/* A deliberately long line checks local horizontal scrolling without expanding the article's reading column. */
```

| 元素 | 字体 | 节奏 | 对齐方式 |
| :--- | :--- | :--- | ---: |
| 正文 | 衬线字体 | 舒展 | 16 |
| 说明 | UI 字体 | 紧凑 | 12 |
| 代码 | Lilex | 清晰 | 14 |

- [x] 浅色与深色主题
- [ ] 长文和复杂嵌套内容

普通文字、*斜体文字*、~~删除内容~~、<mark>轻量高亮</mark>，以及 H<sub>2</sub>O 和 x<sup>2</sup>。脚注引用也应清晰。[^note]

<figure>
<img src="/avatar-224.webp" alt="Lynk 的头像" width="224" height="224" />
<figcaption>图注与图片作为一个整体，保留稳定的间距。</figcaption>
</figure>

<details>
<summary>展开补充说明</summary>
<p>这里是补充内容，沿用正文排版，不额外套用卡片。</p>
</details>

#### 四级标题

普通正文承接小节内容。

##### 五级标题

正文不随标题层级缩小。

###### 六级标题

保持可读的字号与柔和墨色。

---

[^note]: 这是脚注内容，包含[返回阅读相关信息](/about)。
