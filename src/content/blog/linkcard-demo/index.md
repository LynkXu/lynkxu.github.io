---
slug: linkcard-demo
title: 新增样式 Demo
pubDate: 2026-06-09
draft: true
---

本文集中演示博客中新增样式的实际效果。

## 默认样式（default）

<div class="link-card" data-url="https://github.com/"></div>

## 封面大图样式（cover）

<div class="link-card link-card--cover" data-url="https://astro.build/" data-style="cover"></div>

## 纯文字样式（minimal）

<div class="link-card link-card--minimal" data-url="https://www.rust-lang.org/" data-style="minimal"></div>

## 普通链接（对比）

这是一个普通链接：[GitHub](https://github.com/)

## 地点注记（纯记录型）

落地重庆已经是傍晚。我们沿着临江路慢慢往回走，拐进一条不起眼的小巷，随便找了一家仍亮着灯的小馆子。

<aside class="location-note" aria-label="地点">
  <strong>梯坎豆花饭</strong>
  <small>重庆市渝中区中兴路 73 号</small>
</aside>

豆花很嫩，蘸水比想象中更香。店里没有什么装饰，几张方桌挨得很近，反而让这一顿饭显得格外踏实。

## 地点注记（可导航型）

第二天傍晚，我们从李子坝一路散步回来。爬过几段坡之后正好有些饿，便在附近找了一家店坐下。

<aside class="location-note" aria-label="地点">
  <strong>李子坝梁山鸡</strong>
  <small>
    重庆市渝中区李子坝正街 113 号 · <a href="https://surl.amap.com/e8A7tJA1w6u7" target="_blank" rel="noopener noreferrer">地图 ↗</a>
  </small>
</aside>

鸡肉和芋头都炖得很软，辣度也刚好。地点信息留在段落之间，需要时可以顺手打开地图，不需要时也不会抢走正文的注意力。
