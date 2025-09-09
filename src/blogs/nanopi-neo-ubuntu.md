# NanoPi-NEO 全志H3移植Ubuntu 22.04 LTS、u-boot、Linux内核/内核树、mt7601u USB-Wi-Fi支持、配置CLion用于Linux驱动开发

## 0. 前言

想在`NanoPi-NEO`上开发屏幕驱动，但是看了下文件目录发现没有内核树，导致最基础的`file_operations`结构体都无法使用，于是寻找内核树安装方法。但官方提供的内核为4.14太旧了`apt`找不到对应的`linux-source`版本(其实后面发现不需要用`apt`，可以在[kernel.org](https://www.kernel.org/)上下载，但反正都装了那就当学习一下怎么移植了)，于是选择自己重新构建了整个系统。

## 1. 准备工作

1. x86_64 Linux 机器或者虚拟机。
 > 如果是**Apple Silicon Mac**最好用**UTM**安装一个**x86_64 Ubuntu server**，因为本文使用的安装**rootfs**的工具仅**x86_64**系统可用。
 > 当然也有`buildroot`和`debootstrap`方法。`debootstrap`感觉一般；`buildroot`或许会比本文方法更好用，但我没用，想使用这种方法可以考虑去参考[这篇文章](https://www.cnblogs.com/toutiegongzhu/p/17606228.html)。
2. 一张sd卡。
3. 创建一个文件夹存放移植所需各种文件，如 `~/nanopi-neo`。

## 2. 准备SD卡
1. 可以选择直接从 [NanoPi-NEO](https://download.friendlyelec.com/NanoPiNEO) 官网烧录一个镜像到SD卡，他会自动帮你分好区(不过也需要修改)，也可以手动操作。
2. 使用`fdisk`进行分区操作(假设这里SD卡是`/dev/sdb`，且已经烧录官方镜像)[^1]
```shell
sudo fdisk /dev/sdb

# 输入m查看各种命令
m
# 输入p打印分区情况
p
```
![](https://img-blog.csdnimg.cn/direct/dc0597b8f2d042b988b34ea3c807adeb.png#pic_center)

3. 如图，`sdb1`是`boot`分区，`sdb2`是`rootfs`分区

4. 官方镜像可能会多一个`sdb3`存放`userdata`，需要删除后两个分区并格式化，下面展示将末尾分区删除。
![](https://img-blog.csdnimg.cn/direct/97cf2253728c4425951a4af5cdda9c42.png#pic_center)

5. 使用如下所示命令创建分区。
![](https://img-blog.csdnimg.cn/direct/d8135d89b0654711869071f3640fc0ea.png#pic_center)

6. 其中`sector`部分延续`sdb1`的**131071**，第二个直接留空
7. 运行下面的命令将`rootfs`分区格式化
```shell
sudo mkfs.ext4 -L rootfs /dev/sdb2
```
> 你也可以选择从头创建SD启动卡，关于这部分可以查看[该教程](https://blog.csdn.net/li171049/article/details/126636040?spm=1001.2014.3001.5506)，这里不做展开

## 3. 移植u-boot

1. 在 [Github](https://github.com/u-boot/u-boot/tags) 上下载最新 `u-boot.tar.gz`，这里以2024.04为例[^2]
2. 在 [Arm GNU](https://developer.arm.com/downloads/-/arm-gnu-toolchain-downloads) 官网按图寻找下载正确的交叉编译链。
![](https://img-blog.csdnimg.cn/direct/e89a4d264805427abd3e0142e51597a1.png#pic_center)

3. 解压
```shell
cd nanopi-neo/
tar -vxzf u-boot-2024.04.tar.gz
tar -vxf arm-gnu-toolchain-13.2.rel1-x86_64-arm-none-linux-gnueabihf.tar.xz
```
4. 安装交叉编译链
```shell
# 修改交叉编译链文件名方便操作
mv arm-gnu-toolchain-13.2.rel1-x86_64-arm-none-linux-gnueabihf arm-none-linux-gnueabihf

# 移动文件夹
sudo mkdir -p /usr/local/toolchains
sudo mv arm-none-linux-gnueabihf /usr/local/toolchains/

# 添加环境变量
vim .bashrc
# 添加以下三行
export PATH=/usr/local/toolchains/arm-none-linux-gnueabihf/bin/:$PATH
export ARCH=arm
export CROSS_COMPILE=arm-none-linux-gnueabihf-
```
5. 编译 u-boot
```shell
cd u-boot-2024.04/
# 生成配置文件
make nanopi_neo_defconfig
# 生成烧录文件 u-boot-sunxi-with-spl.bin
make -j8
# 烧录到SD卡
sudo dd if=u-boot-sunxi-with-spl.bin of=/dev/sdb bs=1024 seek=8 oflag=direct
```
> 出现错误一般是有模块没有安装，可以自行搜索怎么安装
## 4. 移植kernel

1. 在 [Kernel Archives](https://www.kernel.org/) 上下载最新的`stable`版本 Linux 内核，这里以6.8.7为例[^2]
2. 编译配置文件
```shell
# 解压
cd ~/nanopi-neo/
tar -vxf linux-6.8.7.tar.xz

# 安装一些工具(可能不全，如果编译遇到缺工具就安装一下)
sudo apt-get install libncurses-dev gawk flex bison openssl libssl-dev dkms libelf-dev libudev-dev libpci-dev libiberty-dev autoconf dwarves bc

cd linux-6.8.7/
# 生成配置文件.config
make sunxi_defconfig
```

3. 增加**usb-wifi**支持(本文以`mt7601u`为例)[^3]
```shell
make menuconfig
```
![](https://img-blog.csdnimg.cn/direct/c0e28a889b274e3ea7cbc23a781a24ba.png#pic_center)

按下<kbd>/</kbd>搜索`mt7601u`，按<kbd>enter</kbd>进行搜索它所需的依赖项

![](https://img-blog.csdnimg.cn/direct/a0c10531a2d24a1ba151bf9fbde07540.png#pic_center)

截个屏或者拍个照，找到所有`[=n]`的对应内容按下<kbd>y</kbd>将它加入内核编译中

![](https://img-blog.csdnimg.cn/direct/f7d9ef6fccbb47f08aed6cc357e41073.png#pic_center)
> 如果按<kbd>y</kbd>出现弹框，并且关闭弹框后发现是`M`不是`*`的话，记得用<kbd>/</kbd>寻找对应内容并一一加入内核编译。
> 如图是未配置进内核而是配置为`module`，需要寻找其他依赖项一一加入内核编译
> ![](https://img-blog.csdnimg.cn/direct/f86f80128b2345c58277eddcb16bac77.png#pic_center)

一直按<kbd>esc</kbd>直到出现该界面，按<kbd>enter</kbd>选择保存配置

![](https://img-blog.csdnimg.cn/direct/1771170f076447bea6b144b8b2235b4c.png#pic_center)

4. 编译`zImage`和`sun8i-h3-nanopi-neo.dtb`
```shell
# 编译时间大概1-2小时
make -j8
```
5. 安装到SD卡中
```shell
sudo mount /dev/sdb1 /mnt
sudo cp arch/arm/boot/zImage /mnt/zImage
sudo cp arch/arm/boot/dts/allwinner/sun8i-h3-nanopi-neo.dtb /mnt/sun8i-h3-nanopi-neo.dtb
sync
sudo umount /mnt
```
6. 将SD卡插入开发板中，进入u-boot命令行拉取内核启动[^4]
```shell
setenv bootcmd 'fatload mmc 0 0x46000000 zImage; fatload mmc 0 0x48000000 sun8i-h3-nanopi-neo.dtb; bootz 0x46000000 - 0x48000000'
setenv bootargs "console=ttyS0,115200 earlyprintk root=/dev/mmcblk0p2 rootfstype=ext4 rw rootwait"
saveenv
boot
```

## 5. 移植rootfs

1. 在 [Ubuntu cdimage](http://cdimage.ubuntu.com/ubuntu-base/) 下载镜像[^5]，本文使用**Ubuntu 22.04 LTS**，则进入`jammy/daily/current/`目录下载`jammy-base-armhf.tar.gz`
2. 创建文件夹并解压
```shell
cd ~/nanopi-neo/
mkdir temp
sudo tar -xpf jammy-base-armhf.tar.gz.tar.gz -C temp
```
3. 安装`qemu-user-static`(就是这东西只支持x86_64，害我好几天配置不好)
```shell
sudo apt-get install qemu-user-static
```
4. 准备工作
```shell
# 网络文件
sudo cp -b /etc/resolv.conf temp/etc/resolv.conf
# qemu文件
sudo cp /usr/bin/qemu-arm-static temp/usr/bin/

# 创建mount.sh文件
touch mount.sh
sudo vim mount.sh
```
5. `mount.sh`文件内容如下
```shell
#!/bin/bash
mnt() {
	echo "MOUNTING"
	sudo mount -t proc /proc ${2}proc
	sudo mount -t sysfs /sys ${2}sys
	sudo mount -o bind /dev ${2}dev
	sudo mount -o bind /dev/pts ${2}dev/pts
}
umnt() {
	echo "UNMOUNTING"
	sudo umount ${2}proc
	sudo umount ${2}sys
	sudo umount ${2}dev/pts
	sudo umount ${2}dev
}

if [ "$1" == "-m" ] && [ -n "$2" ] ;
then
	mnt $1 $2
elif [ "$1" == "-u" ] && [ -n "$2" ];
then
	umnt $1 $2
fi
```
> 很多教程这里会让你换国内源，但是我每次换源后apt很多东西装不上，因此请自行选择是否换apt源
> 关于换源方法见：[清华 Ubuntu Ports 软件仓库](https://mirrors.tuna.tsinghua.edu.cn/help/ubuntu-ports/)

6. 使用chroot进入根目录
```shell
# 修改文件权限
chmod 777 mount.sh
# 运行.sh文件
./mount.sh -m temp/
# 切换root
sudo chroot temp
```
7. 运行必要命令
```shell
# apt更新
apt update
apt upgrade
apt-get update

# 安装必要工具
apt install -y systemd
apt install vim sudo openssh-server net-tools network-manager
apt install ifupdown htop iputils-ping kmod rsync

# 添加用户
useradd -s '/bin/bash' -m -G adm,sudo username
# 添加用户密码
passwd username
# 添加root密码
passwd root

# 退出
exit
./mount.sh -u temp/
```
8. 把内核源码复制到`rootfs`中
```shell
sudo cp -r linux-6.8.7/ temp/usr/src/
```
9. 安装`rootfs`到SD卡
```shell
sudo mount /dev/sdb2 /mnt
sudo rm -rf /mnt/*
sudo cp -rp temp/* /mnt/
sudo umount /mnt/
```
10. 插入SD卡，开机，首先连接网络
```shell
nmcli n
# 如果是disabled运行下面这行命令
nmcli n on
# 查看网络设备
nmcli dev
```
![](https://img-blog.csdnimg.cn/direct/e7845dcfc084475c8146b96b01487380.png#pic_center)

`wifi`一般是正常的，`eth0`如果是`unmanaged`则运行该命令[^6]
```shell
sudo nmcli dev set eth0 managed yes
```
> 我这样成功了，但不保证一定可以。如果仍然不行可以看注脚的网址，那篇回答同时介绍了另一种方法

连接wifi
```shell
# 打开Wi-Fi
nmcli r wifi on
# 扫描附近Wi-Fi热点
nmcli dev wifi
# 连接Wi-Fi，替换SSID为Wi-Fi名，PASSWORD为Wi-Fi密码
nmcli dev wifi connect "SSID" password "PASSWORD" ifname wlx70f11c658d80
```
配置静态ip
```shell
# 获取当前ip(假设获取到ip为192.168.31.102)
ifconfig
# 将当前ip设为静态ip
sudo nmcli con mod wlx70f11c658d80 ipv4.method manual ipv4.addr 192.168.31.102/24 ipv4.gateway 192.168.31.1 ipv4.dns 192.168.31.1
sudo reboot
```
11. 解决中文乱码[^7]
```shell
locale -a
```
![](https://img-blog.csdnimg.cn/direct/07f892ba342f4f1fac94d68623c1aefb.png#pic_center)
正常情况下这里应该只有`C`、`C.utf8`、`POSIX`，输入下面的命令
```shell
sudo dpkg-reconfigure locales
```
按3下<kbd>enter</kbd>直到出现如图所示内容

![](https://img-blog.csdnimg.cn/direct/4f45578579fa487081627fd4ce04a194.png#pic_center)

输入下面这些数字并回车
```shell
# en_US, zh_CN, zh_SG
160 492 497
```
![](https://img-blog.csdnimg.cn/direct/cdbfea8b41d34cdaa537c03b549e1881.png#pic_center)
选择自己想作为的系统主语言，回车，等待配置完成后重启即可。

12. 修改`hostname`
```shell
#修改文件第一行为自己想要的名字即可
sudo vim /etc/hostname
```

## 6. 移植内核树

理论上只需要这样就可以了[^8]
```shell
cd /usr/src/linux-6.8.7/
# 因为之前移植kernel编译过了，应该不用再make一遍了吧？
# 反正不行就再make一次(被打)
sudo make modules
sudo make modules_install
```

## 题外话(配置Clion用于Linux驱动开发)

这篇文章起因是Clion无法找到`file_operations`结构体，但这样移植之后还是找不到。配置Clion远程开发的教程很多，比如[这篇](https://zhuanlan.zhihu.com/p/661990065)，这里不做赘述，仅提出我这个问题的解决办法：
1. 在`CMakeLists.txt`中加入这样一段
```c
include_directories("/usr/src/linux-6.8.7/include/")
```
2. `File -> Reload CMake Project`
3. `Tool -> Resync with Remote Hosts`
---
[^1]: [ubuntu制作SD启动卡](https://blog.csdn.net/li171049/article/details/126636040?spm=1001.2014.3001.5506)
[^2]: [全志H3 | 移植主线最新uboot 2023.04和kernel 6.1.11到Nanopi NEO开发板](https://cloud.tencent.com/developer/article/2314079?pos=comment)
[^3]: [usbwifi网卡mt7601u驱动配置](https://www.jianshu.com/p/f3838626a0c8)
[^4]: [Uboot命令](https://www.cnblogs.com/zhaipanger/p/12985606.html)
[^5]: [Ubuntu rootfs customization](https://wiki.t-firefly.com/en/Firefly-Linux-Guide/custom_ubuntu_rootfs.html)
[^6]: [Ethernet device not managed](https://askubuntu.com/questions/882806/ethernet-device-not-managed)
[^7]: [解决ubuntu系统中文乱码问题](https://blog.csdn.net/qq_31375855/article/details/108118957)
[^8]: [【Linux内核树】五步构建](https://blog.csdn.net/weixin_39591031/article/details/121710076?spm=1001.2014.3001.5506)