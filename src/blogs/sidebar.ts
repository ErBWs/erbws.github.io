import { DefaultTheme } from "vitepress";

export function blogSidebar(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: '开发',
      items: [
        { text: '在 Clion 中配置 CH32 RISC-V 工具链', link: '/blogs/ch32-with-clion' },
        { text: 'NanoPi-NEO 移植 Ubuntu 22.04', link: '/blogs/nanopi-neo-ubuntu' },
        { text: '解决 macOS STM32 开发找不到头文件等问题', link: '/blogs/macos-stm32-missing-stdint' },
        { text: 'macOS 配置 cheat sheet', link: '/blogs/macos-env' },
        { text: '在 WSL2 上配置 Isaac Gym 宇树机器人强化学习环境', link: '/blogs/isaac-gym-wsl2' },
      ]
    },
  ]
}
