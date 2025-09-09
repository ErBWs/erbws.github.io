# macOS 环境配置 cheat sheet

## 前言

这是一个单纯的记录性文档，用来记录我如何从头开始配置 macOS 上我需要的开发环境

> **Q: 为什么不用 nix-darwin?**
>
> A: 这东西太复杂了，为了安装某个工具链还需要搜索配置一大堆内容，make life simple

下面正式开始

## 工具链文件夹

首先创建一个工具链文件夹，后续工具链基本都配置在该文件夹内，方便管理

```shell
mkdir ~/dev/toolchains/
cd ~/dev/toolchains
```

## oh-my-zsh

```shell
#添加一个临时 proxy 用来访问 raw.githubusercontent.com
export https_proxy=http://127.0.0.1:7890 http_proxy=http://127.0.0.1:7890 all_proxy=socks5://127.0.0.1:7890

sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

修改生成的 `～/.zshrc` 

1. 终端主题 `ZSH_THEME="af-magic"`
2. 添加 proxy

## Ghostty

### 安装

从[官网](https://ghostty.org/download)下载 .dmg 文件并安装，添加自定义配置

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

1. 找到一个默认打开方式为 `终端` 的文件
2. 右键显示简介，将打开方式修改为 Ghostty，并全局应用

## Homebrew

```shell
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# ~/.zshrc
export PATH=/opt/homebrew/bin:$PATH
```

## Git

macOS 自带 git，但需要 PAT (Personal Access Token) 才能克隆私有仓库或推送

标准做法：使用 GCM (Git Credential Manager)

```shell
brew install --cask git-credential-manager
```

懒人做法：从[官网](https://github.com/apps/desktop)下载 Github Desktop 并用网页登录，会自动 git config

## Flutter

Flutter 分为原始仓库 [flutter / flutter](https://github.com/flutter/flutter) 和 [OpenHarmony-TPC / flutter_flutter](https://gitcode.com/openharmony-tpc/flutter_flutter)，其中后者提供了 ohos 支持

### flutter 安装

可以考虑直接从 [Archive](https://docs.flutter.dev/release/archive) 下载 zip 或者 git clone。我的本地环境从 GitHub clone 下载速度更快

```shell
git clone -b stable https://github.com/flutter/flutter.git

# ~/.zshrc
export PATH=~/dev/toolchains/flutter/bin:$PATH
```

### flutter_ohos 安装

```shell
git clone -b 3.22.0-ohos https://gitcode.com/openharmony-tpc/flutter_flutter.git flutter_ohos

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

> **Q: 为什么不用 fvm?**
>
> A: 我找不到用 fvm 的理由，IDEA 可以自己管理 flutter 依赖

## JDK

从 [Eclipse Temurin](https://adoptium.net/zh-CN/temurin/releases/) 官网下载对应版本和架构的 `.pkg` 文件进行安装。通过修改 `JAVA_HOME` 路径来切换 java 版本

```shell
# ~/.zshrc
export TEMURIN_17=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home
export TEMURIN_21=/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home
export JAVA_HOME=$TEMURIN_17
```

- HarmonyOS SDK - JDK17
- Android - JDK17

## macOS/iOS

### Xcode

从 App Store 下载 Xcode

```shell
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -runFirstLaunch
sudo xcodebuild -license
```

### CocoaPods

一定不要用[官网](https://cocoapods.org/)提供的 sudo gem install cocoapods

```shell
brew install cocoapods
```

## Node.js

通过[官方网站](https://nodejs.org/en/download/)的命令进行安装，以 Node.js v22.19.0 (LTS) 和 nvm v0.40.3 为例

```shell
# Download and install nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# Download and install Node.js:
nvm install 22

# Verify the Node.js version:
node -v # Should print "v22.19.0".
nvm current # Should print "v22.19.0".

# Download and install pnpm:
corepack enable pnpm

# Verify pnpm version:
pnpm -v
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
