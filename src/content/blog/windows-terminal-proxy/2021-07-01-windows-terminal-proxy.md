---
slug: 2021-07-01-windows-terminal-proxy
title: v2ray 下 windows terminal 代理的配置
description: terminal 中的代理之前尝试过很多次一直没有成功，这个问题直到前两天才解决
pubDate: 2021-07-01
tags:
  - windows
  - proxy
  - v2ray
image: "https://source.unsplash.com/duMttyw2Xc0/1600x900"
---

## 初衷

Windows 下的浏览器的代理是很容易解决的，各种软件或者插件都能直接解决，可是 terminal 中的代理之前尝试过很多次一直没有成功。这也导致了一直没有成功安装 Gatsby 。而且没有代理，git clone 也经常失败。这个问题直到前两天才解决。

## 解决

1. 网上其实相应的解决方法都有很多，但是一直就是失败。下面是一般的方法：

```bash
set http_proxy=http://127.0.0.1:1080
set http_proxys=http://127.0.0.1:1080
```

- 这里的配置是一次性的，即当前会话关闭后，该配置就会失效。
- http 和 https 都要设置。

2. 然后使用 `curl -v http://www.google.com` 进行验证即可。

我们都知道1080是指端口，所以我们要把它替换为我们主机上对应的监听端口号。我使用的是 v2ray， 在设置里我们能看到本地的监听端口号为10808， 那就把1080替换为10808。

看似很简单的过程，那为什么一直失败呢？

经过不断的搜索，终于在 [github issues-无法正确使用v2ray](https://github.com/v2ray/v2ray-core/issues/382 ) 中看到：

> **`V2rayN`的情况下，右键开启`http`代理时，`http`代理的端口是`socks+1`**。比如`V2ray`的配置文件`socks`代理是1080，那么默认`http`代理就是1081。有些软件只能用`http`代理不能用`socks`代理，这时就要用到1081这个。否则指向1080端口的话，v2ray就会不停的报错 `v2ray.com/core/proxy/socks: unknown Socks version xx`

原来端口号应该是10809 ！把端口号改为10809后，成功！

是个很小的问题，但是却困扰了我很久，遂记录一下。
