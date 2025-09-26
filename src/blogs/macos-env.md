# macOS 配置 cheat sheet

## 前言

这是一个单纯的记录性文档，用来记录我如何从头开始配置 macOS 上我需要的内容和开发环境

> [!TIP] 为什么不用 nix-darwin?
>
> 这东西太复杂了，为了安装某个工具链还需要搜索配置一大堆内容，make life simple

下面正式开始

## 工具链文件夹

首先创建一个工具链文件夹，后续工具链基本都配置在该文件夹内，方便管理

```shell
mkdir ~/dev/toolchains/
cd ~/dev/toolchains
```

## oh-my-zsh

```shell
sh -c "$(curl -fsSL https://gitee.com/mirrors/oh-my-zsh/raw/master/tools/install.sh)"
```

在 `~/.zshrc` 中修改终端主题为 `ZSH_THEME="af-magic"`

## Homebrew

```shell
export HOMEBREW_BREW_GIT_REMOTE="https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/brew.git"
export HOMEBREW_CORE_GIT_REMOTE="https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/homebrew-core.git"
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# ~/.zshrc
export PATH=/opt/homebrew/bin:$PATH
```

## Ghostty

### 安装

```shell
brew install --cask ghostty
```

### 添加自定义配置

```ini
# window
window-width = 80
window-height = 24

# cursor
shell-integration-features = no-cursor
cursor-style = block
cursor-style-blink = false

# font
font-size = 18
font-thicken = true
```

### 配置右键菜单 `在终端中打开` 使用 Ghostty

1. 找到 `/opt/homebrew/bin` 下的 `brew` Unix 可执行文件
2. 右键显示简介，将打开方式修改为 Ghostty，并全局应用

## 字体

通过 Homebrew 安装常用字体

```shell
# 思源黑体
brew install --cask font-source-han-sans-vf
# 思源宋体
brew install --cask font-source-han-serif-vf
# 霞鹜文楷 GB
brew install --cask font-lxgw-wenkai-gb
# JetBrains Mono
brew install --cask font-jetbrains-mono
# 得意黑
brew install --cask font-smiley-sans
```

## Git

macOS 自带 git，但需要 PAT (Personal Access Token) 才能克隆私有仓库或推送

- 标准做法：使用 GCM (Git Credential Manager)

```shell
brew install --cask git-credential-manager
```

- 懒人做法：从[官网](https://github.com/apps/desktop)下载 Github Desktop 并用网页登录，会自动 git config

## 嵌入式

```shell
brew install --cask gcc-arm-embedded
brew install open-ocd
```

## Flutter

Flutter 分为原始仓库 [flutter / flutter](https://github.com/flutter/flutter) 和 [OpenHarmony-TPC / flutter_flutter](https://gitcode.com/openharmony-tpc/flutter_flutter)，其中后者提供了 ohos 支持

### flutter 安装

可以考虑直接从 [Archive](https://docs.flutter.dev/release/archive) 下载 zip，使用 Homebrew 或者 git clone。
但我喜欢手动管理位置，因此选择使用 git clone

```shell
git clone -b stable https://github.com/flutter/flutter.git

# ~/.zshrc
export PATH=~/dev/toolchains/flutter/bin:$PATH
```

### flutter_ohos 安装

```shell
git clone -b oh-3.32.4-dev https://gitcode.com/openharmony-tpc/flutter_flutter.git flutter_ohos

# ~/.zshrc
alias flutter_ohos="~/dev/toolchains/flutter_ohos/bin/flutter"
alias dart_ohos="~/dev/toolchains/flutter_ohos/bin/dart"
```

### 更新

```shell
# flutter
flutter upgrade

# flutter_ohos
cd ~/dev/toolchains/flutter_ohos
git pull origin
```

> [!TIP] 为什么不用 fvm?
>
> 我找不到用 fvm 的理由，IDEA 可以自己管理 flutter 依赖

## JDK

根据 [Eclipse Temurin](https://adoptium.net/zh-CN/temurin/releases/) 官网使用 Homebrew 进行安装。通过修改 `JAVA_HOME` 路径来切换 java 版本

```shell
brew install --cask temurin@21
brew install --cask temurin@17

# ~/.zshrc
export TEMURIN_17=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home
export TEMURIN_21=/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home
export JAVA_HOME=$TEMURIN_17
```

- HarmonyOS SDK - JDK17
- Android - JDK17

## Node.js

```shell
brew install node
brew install pnpm
```

## macOS/iOS

### Xcode

从 App Store 下载 Xcode

```shell
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -runFirstLaunch
sudo xcodebuild -license
```

### CocoaPods

> [!CAUTION]
> 
> 一定不要用[官网](https://cocoapods.org/)提供的 sudo gem install cocoapods

```shell
brew install cocoapods
```

## HarmonyOS SDK

从[官网](https://developer.huawei.com/consumer/cn/deveco-studio/)下载 DecEco Studio

```shell
# ~/.zshrc
export TOOL_HOME=/Applications/DevEco-Studio.app/Contents
export DEVECO_SDK_HOME=$TOOL_HOME/sdk
export PATH=$TOOL_HOME/tools/ohpm/bin:$PATH
export PATH=$TOOL_HOME/tools/hvigor/bin:$PATH
export PATH=$TOOL_HOME/sdk/default/openharmony/toolchains:$PATH
```

## Android SDK

使用 IDEA 或 Android Studio 下载 SDK，并配置环境变量

```shell
# ~/.zshrc
export ANDROID_HOME=~/dev/toolchains/android/sdk
export PATH=~/dev/toolchains/android/sdk/platform-tools:$PATH
```
