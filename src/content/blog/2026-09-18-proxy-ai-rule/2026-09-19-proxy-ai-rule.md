---
slug: 2026-09-18-proxy-ai-rule
title: 解决代理访问 AI 时异常流量问题
tags:
  - proxy
  - Gemini
  - AI
pubDate: 2026-09-18
---

## 问题和现象

当我们使用 proxy 访问国外 AI 的时候，经常会因为网络问题被 ban，提示「当前地区不可用」、「检测到异常流量」等等。

比如 Gemini，网页版和 APP 都很容易被 ban，从而无法使用。

![](https://images.lynkxu.com/2026/09/bfafbb60ff994d7c9b5f3358680270c3.png)


## 如何解决

这里就要推荐一个非常好用的开源库了！这是一份持续维护、覆盖全面的海外 AI 服务分流规则。支持  Surge / Clash / sing-box / Shadowrocket 工具客户端。

- https://github.com/viewer12/OverseasAI.list

在项目的 Readme 中给出了各个工具对于的 rule list 链接，我们只需要对于添加到工具中即可。

这里以我使用的 ShadowRocket mac 客户端为例：
1. 在 APP 的「配置」页面点击 `default.conf` 后的 i 符号
2. 选择「规则」这一项，点击右上角的「+」，添加如图的 `RULE-SET` 即可。

> 手机端也是同样的配置方式

<div class="img-grid cols-2">
  <figure>
    <img src="https://images.lynkxu.com/2026/09/cf46f12122984429bfb84cb1b07654d1.png" alt="" loading="lazy" />
    <figcaption>配置页面</figcaption>
  </figure>
  <figure>
    <img src="https://images.lynkxu.com/2026/09/0ae7101231614c2981843c60bf5c97af.png" alt="" loading="lazy" />
    <figcaption>规则页面</figcaption>
  </figure>
</div>
