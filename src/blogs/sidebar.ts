import { DefaultTheme } from "vitepress";

export function blogSidebar(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: '开发',
      items: [
        { text: '在 Clion 中配置 CH32 RISC-V 工具链', link: '/blogs/ch32-with-clion' },
        { text: 'NanoPi-NEO 移植 Ubuntu 22.04', link: '/blogs/nanopi-neo-ubuntu' },
        { text: 'macOS 环境配置 cheat sheet', link: '/blogs/macos-env' },
        { text: '在 WSL2 上配置 Isaac Gym 宇树机器人强化学习环境', link: '/blogs/isaac-gym-wsl2' },
      ]
    },
  ]
}
