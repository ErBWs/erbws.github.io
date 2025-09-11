# erbws.github.io

个人博客网站，基于 VitePress / TypeScript / Vue。

## 部署

安装依赖

```shell
pnpm install
```

运行

```shell
pnpm run dev
```

## 依赖

- [medium-zoom](https://github.com/francoischalifour/medium-zoom)
- [vitepress-plugin-group-icons](https://github.com/yuyinws/vitepress-plugin-group-icons)
- [markdown-it-footnote](https://github.com/markdown-it/markdown-it-footnote)

> [!CAUTION]
> 
> 如果想在自己的网站中同时使用 `markdown-it-footnote` 和 `TypeScript`，需要使用专门的 TypeScript 版本：
> ```shell
> pnpm add @types/markdown-it-footnote
> ```