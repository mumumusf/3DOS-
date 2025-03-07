# 3DOS 自动收获机器人使用说明

## 🎯 功能介绍

这是一个用于自动化收获3DOS积分的工具，主要功能包括：
- 多账户管理和自动收获
- 支持多种代理格式
- 实时显示收益情况
- 自动重试和错误处理

## 📋 运行环境要求

- Node.js 22.x 版本
- npm 10.x 或更高版本
- 稳定的网络连接
- 有效的3DOS账户

## 🚀 快速开始

### 1. 注册账号
1. 访问注册链接：[点击注册](https://dashboard.3dos.io/register?ref_code=cf91c7)
2. 使用邮箱注册
3. 输入邀请码：`cf91c7`
4. 完成注册并登录
5. 获取账户信息：
   - 按 F12 打开开发者工具
   - 切换到 Application 标签
   - 在左侧找到 Local Storage
   - 找到并复制 API Secret 和 Bearer Token

### 2. Windows 环境安装

1. 安装 Node.js
   - 访问 [Node.js官网](https://nodejs.org/)
   - 下载并安装 Node.js 22.x 版本
   - 安装完成后打开命令提示符(CMD)，输入 `node -v` 验证安装

2. 下载程序
   ```bash
   git clone https://github.com/mumumusf/3DOS-.git
   cd 3DOS-
   npm install
   ```

### 3. Linux/VPS 环境安装

1. 安装必要软件
   ```bash
   # Ubuntu/Debian系统
   apt update
   apt install -y curl git screen

   # CentOS系统
   yum update
   yum install -y curl git screen
   ```

2. 下载并安装 NVM
   ```bash
   # 下载 NVM 安装脚本
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

   # 配置环境变量（根据你的shell选择其中一个）
   source ~/.bashrc   # 如果使用 bash
   source ~/.zshrc    # 如果使用 zsh

   # 验证 NVM 安装
   nvm --version
   ```

3. 安装并配置 Node.js
   ```bash
   # 安装 Node.js 22
   nvm install 22

   # 查看已安装的版本
   nvm list

   # 设置默认使用 Node.js 22
   nvm use 22
   nvm alias default 22

   # 验证安装
   node -v   # 预期输出: v22.13.1
   nvm current # 预期输出: v22.13.1
   npm -v    # 预期输出: 10.9.2
   ```

4. 下载并配置程序
   ```bash
   # 克隆仓库
   git clone https://github.com/mumumusf/3DOS-.git
   cd 3DOS-

   # 安装依赖
   npm install



5. 使用 Screen 运行程序
   ```bash
   # 创建新的 screen 会话
   screen -S 3dos

   # 在 screen 会话中运行程序
   npm start

   # 分离 screen 会话（保持程序在后台运行）
   # 按 Ctrl + A，然后按 D
   ```

6. Screen 会话管理
   ```bash
   # 查看所有 screen 会话
   screen -ls

   # 重新连接到 screen 会话
   screen -r 3dos

   # 终止 screen 会话（在会话中）
   exit

   # 强制终止 screen 会话（在会话外）
   screen -X -S 3dos quit
   ```

7. 常用操作
   ```bash
   # 查看程序运行状态
   screen -r 3dos  # 重新连接到会话

   # 停止程序
   # 1. 重新连接到会话
   screen -r 3dos
   # 2. 按 Ctrl + C 停止程序
   # 3. 输入 exit 退出会话

   # 更新配置后重启
   # 1. 重新连接到会话
   screen -r 3dos
   # 2. 按 Ctrl + C 停止当前程序
   # 3. 运行 npm start 重启程序
   # 4. 按 Ctrl + A, 然后按 D 分离会话
   ```

8. 注意事项
   - 确保 screen 会话不会因系统重启而终止
   - 定期检查程序运行状态
   - 如遇到问题，查看程序输出日志
   - 建议设置 screen 会话自动重启

9. 推荐设置
   - 将以下命令添加到 `/etc/rc.local` 或 `crontab` 实现开机自启：
     ```bash
     @reboot screen -dmS 3dos bash -c 'cd /root/3Dos-Auto-Bot && npm start'
     ```

## ⚙️ 配置教程

### 1. 获取账户信息

1. 打开 3DOS 仪表板网站
2. 按 F12 打开开发者工具
3. 切换到 Application 标签
4. 在左侧找到 Local Storage
5. 找到并复制：
   - API Secret
   - Bearer Token



###2. 代理配置（可选）

支持以下格式：
```
# 基础格式
ip:port

# 带用户名密码
ip:port:username:password

# 完整格式
protocol:ip:port:username:password

# URL格式
http://username:password@ip:port
socks5://username:password@ip:port
```

## 🖥️ 运行程序

1. 启动程序
   ```bash
   npm start
   ```

2. 首次运行配置
   - 按提示输入 Secret
   - 按提示输入 Token
   - 按提示输入代理地址（可选）

3. 运行状态说明
   ```
   ✓ 账户 1: 收获数据发送成功
   用户名: 3DOS User (Basic)
   今日收益: 2462 积分 (2025/2/20)
   总忠诚度积分: 11457
   ```

4. 停止程序
   - 按 `Ctrl + C` 
   - 等待程序优雅退出

## ❗ 常见问题

1. 代理连接失败
   - 检查代理地址格式
   - 确认代理是否可用
   - 尝试更换代理

2. Token过期
   - 重新获取 Token
   - 更新 token.txt 文件

3. 收获失败
   - 检查网络连接
   - 确认账户状态
   - 查看错误信息

## 📝 注意事项

1. 安全建议
   - 定期更换 Token
   - 使用可靠的代理
   - 不要分享账户信息

2. 使用建议
   - 保持程序稳定运行
   - 定期检查收益情况
   - 及时处理错误提示

## ⚠️ 免责声明

- 本程序仅供学习交流使用
- 使用本程序产生的任何后果由用户自行承担
- 请遵守相关平台的服务条款

## 📱 联系方式

- Twitter：[@YOYOMYOYOA](https://x.com/YOYOMYOYOA)
- Telegram：[@YOYOZKS](https://t.me/YOYOZKS)

---
由 [@YOYOMYOYOA](https://x.com/YOYOMYOYOA) 用❤️制作




