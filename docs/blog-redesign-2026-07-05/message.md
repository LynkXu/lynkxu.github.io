# Message Page Design

## Page

`/message`

## Job

保留留言入口，让评论加载区融入新阅读风格。

## Content To Keep

- `<Comments showLinuxDo={false} manualTwikooLoad={true} />`
- Twikoo lazy gate 和手动加载行为。
- Mastodon / GitHub 联系入口。

## Layout

- 主区只展示留言标题和评论区域，不添加额外说明。
- 加载按钮使用细线按钮，和全站链接风格一致。
- 右侧 context 放三个联系入口，文字保持短。

## Acceptance

- Twikoo 未加载和加载后都不显得像外来组件。
- 不出现长说明文案。
- 移动端按钮不溢出。

## Final Review

- Kept the manual Twikoo lazy load component unchanged.
- Reworked the lazy gate and contact links into thin-line controls.
- Second pass removed residual pill-button styling in the contact rail.
- Verified desktop, mobile, and dark desktop screenshots. No horizontal overflow.
