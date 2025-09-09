import { defineConfig } from 'vitepress'
import { blogSidebar } from '../src/sidebar'
import footnote_plugin = require("markdown-it-footnote")

export default defineConfig({
  srcDir: "./src",
  title: "ErBW_s",
  head: [["link", { rel: "icon", href: "/favicon.ico" }]],

  markdown: {
    image: {
      lazyLoading: true,
    },
    config: (md) => {
      md.use(footnote_plugin)
    }
  },

  lastUpdated: true,

  themeConfig: {
    logo: '/logo.png',

    nav: [
      { text: '主页', link: '/' },
      { text: '博客', link: '/blogs' }
    ],

    sidebar: {
      '/blogs/': blogSidebar()
    },

    outline: {
      label: '页面导航'
    },

    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },

    search: {
      provider: "local",
    },

    notFound: {
      quote: '吔？页面不见了',
      linkText: '回首页'
    },

    lastUpdated: {
      text: "最新更新于",
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ErBWs' }
    ]
  }
})
