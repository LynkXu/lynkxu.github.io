---
publishDate: 2024-12-20
tag: tech
---

重新理解了 React Hooks 的闭包陷阱问题。

useEffect 和 useState 的组合使用时，如果不注意依赖项数组，很容易出现闭包问题。关键是要理解每次渲染都会创建新的函数作用域。
