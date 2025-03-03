# LayerEdge 自动化工具

## 🎯 项目注册

1. 访问官网：[LayerEdge](https://dashboard.layeredge.io/)
2. 点击 "Connect Wallet" 连接钱包
3. 使用邀请码：`u5AVxlcK`

---

LayerEdge 节点自动化管理工具，支持多钱包、多代理、定时任务等功能。

## 🌟 主要功能

- ✨ 自动运行节点
- 🔄 每小时自动领取积分
- 🔐 多钱包批量管理
- 📡 支持多种代理格式
- 🤖 全自动化运行
- 🕒 定时执行任务

## 📋 环境要求

- Linux/Windows 服务器或本地电脑
- Node.js 22.x 版本
- 稳定的网络环境
- （可选）HTTP/SOCKS5代理

## 🚀 安装教程

### Windows 环境

1. 下载并安装 [Node.js 22.x](https://nodejs.org/)
2. 下载此项目源码
3. 按照下方配置说明进行设置

### Linux VPS 环境

1. 安装 NVM
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# 根据您的终端选择：
source ~/.bashrc   # bash用户
source ~/.zshrc    # zsh用户
```

2. 安装 Node.js
```bash
# 安装 Node.js 22
nvm install 22

# 设置默认版本
nvm use 22
nvm alias default 22

# 验证安装
node -v
npm -v
```

3. 下载项目
```bash
git clone https://github.com/mumumusf/layeredge.git
cd layeredge
```

4. 安装依赖
```bash
npm install
```

## ⚙️ 配置说明

### 1. 钱包配置 (wallets.json)
```json
[
  {
    "address": "你的钱包地址",
    "privateKey": "你的私钥"
  }
]
```

### 2. 代理配置 (proxy.txt)
支持以下格式：
```
ip:port
ip:port:username:password
http://username:password@ip:port
socks5://username:password@ip:port
```

## 🎮 使用方法

### 1. 普通启动
```bash
npm run start
```

### 2. 使用 Screen 后台运行（推荐）
```bash
# 安装 screen（如未安装）
apt update
apt install screen -y

# 创建新的 screen 会话
screen -S layeredge

# 进入项目目录
cd LayerEdge-Auto-Bot

# 启动程序
npm run start

# 按 Ctrl+A+D 将程序放入后台运行

# 重新连接到程序界面
screen -r layeredge

# 查看所有 screen 会话
screen -ls
```

### 3. 按照提示进行操作：
   - 选择是否使用现有配置
   - 如果选择否，可以手动输入新的钱包和代理信息
   - 程序会自动保存配置并开始运行

## ⚠️ 注意事项

1. 请勿泄露您的私钥
2. 建议使用代理以提高成功率
3. 如遇到问题，请检查网络连接和代理设置
4. 程序出错会自动重试，无需手动干预
5. 可以同时添加多个钱包和代理

## 🔄 更新日志

### v1.0.0
- 支持多钱包管理
- 添加代理支持
- 实现自动化任务
- 优化错误处理
- 添加中文界面

## ⚠️ 免责声明

- 本程序仅供学习交流使用
- 使用本程序产生的任何后果由用户自行承担
- 请遵守相关平台的服务条款

## 📱 联系方式

- Twitter：[@YOYOMYOYOA](https://x.com/YOYOMYOYOA)
- Telegram：[@YOYOZKS](https://t.me/YOYOZKS)

---
由 [@YOYOMYOYOA](https://x.com/YOYOMYOYOA) 用❤️制作

## 🔗 相关链接

- 项目仓库：[GitHub](https://github.com/mumumusf/layeredge)
- 官方网站：[LayerEdge](https://dashboard.layeredge.io/)

