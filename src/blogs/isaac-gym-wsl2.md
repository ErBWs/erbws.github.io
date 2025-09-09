# 在 WSL2 上配置 Isaac Gym 宇树机器人强化学习环境

## 前言

微软开发并开源了 WSL (Windows Subsystem for Linux)，相比安装双系统，WSL2 的使用更加灵活。因此在需要配置 Isaac Gym 环境时我优先考虑了是否可以使用 WSL 进行仿真运行。幸运的是在谷歌了一番后成功找到这样一篇[成功案例](https://ljoson.github.io/views/AI/RL/env.html)，于是便开始了我的折腾之路

## 准备工作

- (可选) 安装 [PowerShell 7](https://github.com/PowerShell/PowerShell)
- 安装 [WindTerm](https://github.com/kingToolbox/WindTerm) / [MobaXterm](https://mobaxterm.mobatek.net/download.html)，我个人更喜欢 WindTerm

这里安装 WindTerm / MobaXterm 一是因为 Windows 的终端真的太难用了，二是为了后续支持 X11 forward 来打开图形化 Isaac Gym 界面

## WSL2 安装

首先当然是安装 WSL2。目前 WSL2 是 Windows 的默认选项，因此直接按照[官网指南](https://learn.microsoft.com/zh-cn/windows/wsl/install)进行安装即可

右键终端，打开 PowerShell

1. 安装 WSL2 并重启电脑

```shell
wsl --install
```

2. 安装 Ubuntu

```shell
# 列出所有可安装的发行版
wsl -l -o

# 选择 20.04 及以上的 Ubuntu 发行版进行安装
wsl --install -d Ubuntu-24.04
```

3. 启动 Ubuntu

```shell
wsl
```

4. Troubleshooting

此时大概率会报错：
```shell
wsl: 检测到 localhost 代理配置，但未镜像到 WSL。NAT 模式下的 WSL 不支持 localhost 代理。
```

解决方案[^1]：

- 前往 `%USERPROFILE%` 文件夹，创建 `.wslconfig`
- 添加如下内容

```
[experimental]
autoMemoryReclaim=gradual
networkingMode=mirrored
dnsTunneling=true
firewall=true
autoProxy=true
```

- 重启 WSL2

```shell
wsl --shutdown
wsl
```

## Ubuntu 准备工作

- (可选) 安装 [zsh](https://github.com/ohmyzsh/ohmyzsh/wiki/Installing-ZSH#ubuntu-debian--derivatives-windows-10-wsl--native-linux-kernel-with-windows-10-build-1903) 和 [ohmyzsh](https://github.com/ohmyzsh/ohmyzsh/wiki#welcome-to-oh-my-zsh)
- 创建一些开发用的文件夹，更好的整理开发环境，例如：

```shell
cd ~
mkdir -p dev/toolchains
```

> 我是 macOS 用户，所以我更熟悉 zsh。其实完全没必要安装 zsh

## SSH

1. 安装 ssh，然后就可以摆脱难用的 Windows 终端了。

```shell
sudo apt install openssh-server
```

这时可能会报错：

```shell
E: Sub-process /usr/bin/dpkg returned an error code (1)
```

解决方案[^2]：

这里的问题是安装时候会尝试启动 ssh 服务并监听 22 端口。但是这里可能会与 Windows 自身的 ssh 监听冲突。因此需要修改 `/etc/ssh/sshd_config` 来配置端口，如修改为 `222`。

```shell
sudo vim /etc/ssh/sshd_config

# sshd_config
...
# port
Port 222
# 强制 ipv4
AddressFamily inet
...
# 允许 ssh root 登录
PermitRootLogin yes
...
# X11
X11Forwarding yes
X11UseLocalhost no
...
```

2. 添加防火墙入站规则

打开 `高级安全 Windows Defender 防火墙`，`入站规则` -> `新建规则...`

![](https://img2024.cnblogs.com/blog/3281656/202505/3281656-20250520195822889-684431114.png)

选择 `端口` -> `下一页` -> `特定本地端口`，填写上面设置的端口 `222`

![](https://img2024.cnblogs.com/blog/3281656/202505/3281656-20250520200137658-473722881.png)

`下一页` -> `下一页` -> `下一页`，输入名称，点击 `完成`

![](https://img2024.cnblogs.com/blog/3281656/202505/3281656-20250520200444534-1810923649.png)

## WindTerm

1. 新建会话，配置主机 `127.0.0.1` 和端口 `222`，填写标签

![](https://img2024.cnblogs.com/blog/3281656/202505/3281656-20250520194141159-7959963.png)

2. 开启 X11 forwarding

选择 `X11` 选项卡，将 `X11显示` 修改为 `内部 X 显示`

![](https://img2024.cnblogs.com/blog/3281656/202505/3281656-20250520193749546-1457863145.png)

> MobaXterm 可以自行寻找开启办法，网上教程很多

3. 双击刚才创建的会话，选择 `账户` 输入用户名和密码进行登录

## CUDA

Windows NVIDIA 驱动现在内置 WSL2 支持，只需要下载 CUDA Toolkit 即可。在[官网](https://developer.nvidia.com/cuda-downloads)一步步选择正确的架构和平台，通过给出的命令行命令进行下载

注意事项：

- Distribution 一定要选择 `WSL-Ubuntu`
- Installer Type 都可以选，我选择的 `deb(network)`，因为整体耗时更短。

以最新版本 12.9 为例(20250519)

![](https://img2024.cnblogs.com/blog/3281656/202505/3281656-20250520183749404-514121525.png)

1. 执行安装命令

```shell
wget https://developer.download.nvidia.com/compute/cuda/repos/wsl-ubuntu/x86_64/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring_1.1-1_all.deb
sudo apt-get update
sudo apt-get -y install cuda-toolkit-12-9
```

2. 添加环境变量至环境变量文件

> 如果安装了 zsh，环境变量文件在 `~/.zshrc`，否则在 `~/.bashrc`
>
> 如果不确定，运行 `echo $SHELL` 进行查看

```shell
export PATH=/usr/local/cuda-12.9/bin:$PATH

# libcuda.so
export LD_LIBRARY_PATH=/usr/lib/wsl/lib/:$LD_LIBRARY_PATH
```

## Miniconda

1. 安装

根据[官方文档](https://www.anaconda.com/docs/getting-started/miniconda/install#linux)进行安装即可

```shell
# 创建文件夹
mkdir -p dev/toolchains/miniconda3

# 下载安装脚本
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O dev/toolchains/miniconda3/miniconda.sh

# 给予运行权限并运行
cd dev/toolchains/miniconda3
chmod 777 miniconda.sh
./miniconda.sh -b -u -p ~/dev/toolchains/miniconda3

# 删除脚本
rm miniconda.sh
```

2. 添加环境变量

`conda init` 会自动添加环境到环境变量文件。如果是 zsh 则运行 `conda init zsh`

```shell
~/dev/toolchains/miniconda3/bin/conda init
```

3. 创建虚拟环境

训练的是宇树开源的 [unitreerobotics / unitree_rl_gym](https://github.com/unitreerobotics/unitree_rl_gym) 工程，根据[安装指南](https://github.com/unitreerobotics/unitree_rl_gym/blob/main/doc/setup_zh.md)配置虚拟环境

```shell
# 创建 python 3.8 虚拟环境
conda create -n unitree-rl python=3.8
# 激活虚拟环境
conda activate unitree-rl
```

后续的安装都需要在这个虚拟环境里进行配置

4. 安装 PyTorch

```shell
conda install pytorch==2.3.1 torchvision==0.18.1 torchaudio==2.3.1 pytorch-cuda=12.1 -c pytorch -c nvidia
```

## Isaac Gym

1. 安装

从[官网](https://developer.nvidia.com/isaac-gym/download)下载 `.tar.gz` 文件，在 Windows 文件资源管理器里找到 Linux 用户文件夹，将下载的文件拷贝进来。

回到 Linux 终端运行下面的命令解压并尝试运行 demo

```shell
# 解压
tar -xzvf IsaacGym_Preview_4_Package.tar.gz -C dev/toolchains/

# 安装
cd dev/toolchains/isaacgym/python
pip install -e .

# 验证运行
cd examples
python 1080_balls_of_solitude.py
```

2. Troubleshooting

大概率第一次无法运行，会出现这样的报错：

![](https://img2024.cnblogs.com/blog/3281656/202505/3281656-20250520225536726-1373668527.png)

解决方案[^3]：

寻找对应的库文件并复制到 `/usr/lib/x86_64-linux-gnu` 文件夹中

```shell
find / -name libpython3.8.so.1.0
sudo cp /home/erbws/dev/toolchains/miniconda3/envs/unitree-rl/lib/libpython3.8.so.1.0 /usr/lib/x86_64-linux-gnu
```

再次运行再次报错：

![](https://img2024.cnblogs.com/blog/3281656/202505/3281656-20250520230025733-1857230960.png)

意思是没有安装 Vulkan，下面安装 Vulkan

## Vulkan

1. 下载

从[官网](https://vulkan.lunarg.com/sdk/home)选择 `Linux` - `Ubuntu Packages`，找到对应 Ubuntu 版本的命令进行下载

![](https://img2024.cnblogs.com/blog/3281656/202505/3281656-20250520231042951-1405422627.png)

```shell
wget -qO - https://packages.lunarg.com/lunarg-signing-key-pub.asc | sudo apt-key add -
sudo wget -qO /etc/apt/sources.list.d/lunarg-vulkan-1.4.313-noble.list https://packages.lunarg.com/vulkan/1.4.313/lunarg-vulkan-1.4.313-noble.list
sudo apt update
sudo apt install vulkan-sdk
```

> 该方法后续会 deprecate，Tarball 安装方法参考[官方文档](https://vulkan.lunarg.com/doc/sdk/1.4.313.0/linux/getting_started.html)

这时运行 `vulkaninfo --summary` 会发现在使用 CPU (llvmpipe) 而不是 NVIDIA GPU，这是因为 WSL2 内置的 mesa 是 CPU 实现[^4]，我们需要使用第三方 mesa 源来启用 GPU

2. 修改 mesa

```shell
sudo add-apt-repository ppa:kisak/kisak-mesa
sudo apt update
sudo apt upgrade
```

3. 修改环境变量

```shell
export VK_ICD_FILENAMES=/usr/share/vulkan/icd.d/dzn_icd.x86_64.json
```

这时再运行 `vulkaninfo --summary` 不出意外可以看到 GPU 被成功识别

> 出意外也没关系，继续往下看

![](https://img2024.cnblogs.com/blog/3281656/202505/3281656-20250520233000686-377228661.png)

4. 再次运行 demo

不出意外已经可以成功运行

> 出意外也没关系，继续往下看

![](https://img2024.cnblogs.com/blog/3281656/202505/3281656-20250520234037671-1172254960.png)

## Unitree RL GYM

最终目的是运行宇树机器人的强化学习环境，因此还需要一些[后续步骤](https://github.com/unitreerobotics/unitree_rl_gym/blob/main/doc/setup_zh.md#23-%E5%AE%89%E8%A3%85-rsl_rl)

1. 拉取工程

```shell
mkdir -p ~/dev/opensource
cd ~/dev/opensource

# rsl_rl
git clone https://github.com/leggedrobotics/rsl_rl.git
cd rsl_rl
git checkout v1.0.2
pip install -e .
cd ..

# unitree_rl_gym
git clone https://github.com/unitreerobotics/unitree_rl_gym.git
cd unitree_rl_gym
pip install -e .
```

2. 运行

```shell
cd ~/dev/opensource/unitree_rl_gym/legged_gym/scripts

# 限制模型数为 1 避免性能不够
python train.py --task=go2 --num_envs=1
```

3. Troubleshooting

大概率这时候会报这样的错误：

![](https://img2024.cnblogs.com/blog/3281656/202505/3281656-20250522013836690-319728203.png)

解决方案[^5]：

将 `/usr/lib/x86_64-linux-gnu/` 内的 `libstdc++.so.6` 软链接到 `unitree-rl` 中

```shell
cd ~/dev/toolchains/miniconda3/envs/unitree-rl/lib
mv libstdc++.so.6 libstdc++.so.6.old
ln -s /usr/lib/x86_64-linux-gnu/libstdc++.so.6 libstdc++.so.6
```

再次运行可以看到成功运行，这时候再去运行 demo 大概率也正常了

> 如果还是运行不了就只有自己谷歌找找有没有解决办法了

![](https://img2024.cnblogs.com/blog/3281656/202505/3281656-20250520235424281-1515234301.png)

## 后记

到此环境就配置完成了。训练时还有其他参数可选，比如 `--headless` 来关闭图形界面

Isaac Gym 毕竟已经 deprecate 了，配置起来总是有各种问题

我配置的时候一路通，直接就配置完成了，结果我朋友跟着我这文档一通操作还是跑不了 demo，一会能跑一会不能跑的，也不知道哪里的问题

实在受不了了去把宇树的工程拉下来跑发现报错，缺少 `GLIBCXX_3.4.32`，我才想起来我没把这个问题写在文档里。结果宇树的工程成功跑起来了，再回去跑 demo 也能跑了，搞不懂

所以上面才会说跑不起来也没事，继续往下看

---

[^1]: [microsoft/WSL#10753 (comment)](https://github.com/microsoft/WSL/issues/10753#issuecomment-1814839310)

[^2]: [Installing openssh-server in Ubuntu-24.04 on WSL2](https://askubuntu.com/questions/1512180/installing-openssh-server-in-ubuntu-24-04-on-wsl2)

[^3]: [【linux】ImportError: libpython3.7m.so.1.0: cannot open shared object file: No such file or directory](https://blog.csdn.net/w5688414/article/details/128070172)

[^4]: [【记录】在WSL2中部署Vulkan开发环境（2022年版）](https://zhuanlan.zhihu.com/p/576320322)

[^5]: [「已解决」anaconda环境version `GLIBCXX_3.4.30‘ not found](https://blog.csdn.net/CCCDeric/article/details/129292944)