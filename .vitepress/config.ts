import { defineConfig } from 'vitepress'
import { blogSidebar } from '../src/blogs/sidebar'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'

// https://blog.csdn.net/ashtyukjhf/article/details/129657613
import footnote_plugin from 'markdown-it-footnote'

export default defineConfig({
  srcDir: "./src",
  title: "ErBW_s",
  head: [["link", { rel: "icon", href: "/favicon.ico" }]],

  markdown: {
    lineNumbers: true,
    image: {
      lazyLoading: true,
    },
    config: (md) => {
      md.use(footnote_plugin)
      md.use(groupIconMdPlugin)
    }
  },

  vite: {
    plugins: [
      groupIconVitePlugin({
        customIcon: {
          'windows': 'logos:microsoft-windows-icon',
          'macos': 'logos:apple-app-store'
        }
      })
    ],
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

    darkModeSwitchLabel: '主题',

    lastUpdated: {
      text: "上次更新",
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ErBWs' }
    ]
  }
})
