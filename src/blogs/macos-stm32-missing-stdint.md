# 解决 macOS STM32 开发找不到头文件等问题

## 问题

编译报错发现是 `arm-none-eabi-gcc` 版本低于 `11`[^1]，于是尝试通过 Homebrew 升级

升级后编译工程时出现大量类似错误如下：

```
/opt/homebrew/Cellar/arm-none-eabi-gcc/13.2.0/lib/gcc/arm-none-eabi/13.2.0/include/stdint.h:9:16: fatal error: stdint.h: No such file or directory
```

## 问题原因

不能使用 `brew install arm-none-eabi-gcc` 安装编译工具链[^2]

## 解决方案

打开终端输入命令[^3]

```shell
brew uninstall arm-none-eabi-gcc
brew autoremove
brew install --cask gcc-arm-embedded
```

[^1]: [non constant or forward reference address expression for section .ARM.extab 错误解决](https://www.cnblogs.com/XuYuFan/p/18094079)
[^2]: [在M2芯片上配置Clion编译和下载stm32](https://blog.csdn.net/Hrilug/article/details/135585031)
[^3]: [Compilation on MacOs - M2 #355](https://github.com/raspberrypi/pico-feedback/issues/355#issuecomment-1754808749)