# 0 成本追踪 10 万个 solana 钱包

作为链上玩家，我尝试过很多钱包追踪工具，但都不满意。大多数工具只能追踪 300 个以内钱包，完全不够用。于是动手写了一个巨无霸钱包信号监控，理论上可以追踪 10 万个钱包的每月 50 万笔交易。为了屏蔽噪音提炼 Alpha，我结合自己的交易策略增加了市值等筛选条件，还用了 deepseek 来自动总结相关推文。现在打起狗来舒服多了。

![screenshot](https://github.com/QuantVela/build-your-onchain-agent/blob/main/img/01screenshot.png)

用到了这些工具，整个系统基本上 0 成本：
- helius webhook 来监听订阅的钱包
- vercel api 路由部署 server
- supabase 存储和 realtime websocket 监听交易
- shyft 解析一些 helius 解析不了的交易，如： pumpfun 内盘、metaora 池
- deepseek 自动总结相关推文
- telegram bot 发送信号

## 如何使用
### Step 1: 环境准备
1. 下载代码库
```
git clone https://github.com/QuantVela/build-your-onchain-agent.git 01-wallets-monitor/wallets-monitor
```
2. 安装依赖
```
npm install
```
3. 配置环境变量
复制 `.env.example` 到 `.env`，填入自己的 API Key 
- [Helius](https://dashboard.helius.dev/dashboard) API Key 和 RPC endpoint
- [Supabase](https://supabase.com/) 的 URL 和 Key
- [Shyft](https://shyft.to/) API Key
- [DeepSeek](https://platform.deepseek.com/) API Key
- [Telegram Bot](https://t.me/BotFather) Bot Token 和 Channel ID 或 Chat ID
- [RapidAPI](https://rapidapi.com/alexanderxbx/api/twitter-api45) 订阅 Twitter API Basic 后获取的 API Key

### Step 2: 数据库设置
1. 创建数据库表
- 登录 Supabase 控制台，进入 SQL Editor
- 执行 `schema.sql` 中的 SQL 语句，从而创建两张表 `txs` 和 `wallets`
- 把你的钱包库上传到 `wallets` 表，可以用 SQL 脚本也可以导入 CSV

2. 开通 Supabase Realtime
- 为 `txs` 表开通 Realtime：进入 Supabase 控制台，Database -> Publications -> 在 supabase_realtime 行仅开通 Insert 选项，在 source 中开通 `txs` 表

### Step 3: 部署和运行
1. 本地测试
```
npm run dev
```
2. 部署到 Vercel

```bash
npm install -g vercel
vercel login
vercel
```
- 登录 Vercel 控制台，选择你的项目
- `Settings` -> `Environment Variables`，添加 SUPABASE_URL 和 SUPABASE_KEY
- 部署到生产环境
```
vercel --prod
```
- 在 Project 中找到 Domains 对应的 URL，类似 `https://your-project-name.vercel.app`

3. 配置 Helius Webhook
- 在 `.env` 修改 `WEBHOOK_URL` 为你的 Webhook URL，类似 `https://your-project-name.vercel.app/api/route`
- 运行 `scripts/run.js` 会把 supabase 的 `wallets` 表中的钱包地址设置为 Webhook 的订阅地址
- 现在检查 Vercel 里的 Logs，预期是在订阅钱包发生新交易时有 200 ok 的 log, 并在 Messages 中显示 Successfully processed and stored with parser

4. 启动监控
- `src/strategy/index.js` 文件中目前是最基础的策略，当 6 小时内多钱包购买同一个 token, 且 token 的市值超过 100k, 创建时间在 7 天内，则触发 telegram 推送提醒。你可以修改成自己的策略。
- 运行 `src/strategy/index.js` 开始监控

## Webhook 和 Websocket
轮询就像是你每分钟给实习生打一次电话问：有没有金狗。Webhook 就像是实习生在有金狗时主动给你打电话，Websocket 就像是你和实习生一直保持语音通话。

在使用 helius 这个场景里，webhook 比私人 RPC 节点要多几百毫秒的延迟，但我的策略并不那么要求速度。如果是需要自动狙击、同一区块内的跟单，可以考虑使用专门的工具或者租用 $499 刀的 Yellowstone RPC。

## 项目结构
```
📁 项目根目录
├── 📁 src/
│   ├── 📁 strategy/
│   │   ├── 📄 index.js           # 监控数据库新交易，检查是否触发策略条件，推送信号
│   │   └── 📄 messageTemplate.js # 发送 Telegram 的消息模板         
│   │
│   └── 📁 utils/
│       ├── 📄 aiSummary.js       # 使用 deepseek 自动总结 token 相关推文
│       ├── 📄 dexscreener.js     # 使用 dexscreener 获取 token 信息
│       ├── 📄 telegram.js        # Telegram 消息发送
│       ├── 📄 tweetApi.js        # 使用 rapidapi 进行推文搜索和账号内容浏览
│       ├── 📄 txsAnalyzer.js     # 计算钱包库的平均购买成本，持仓比例
│       ├── 📄 solPrice.js        # 为了提高计算速度，把 sol 价格缓存，每 10 分钟更新一次
│       ├── 📄 txParser.js        # 对于helius无法解析的swap交易如pumpfun内盘，使用shyft解析
│       └── 📄 swapProcessor.js   # 对于helius解析好的swap交易，整理成存入数据库的数据结构
│
├── 📁 pages/api
│   └── 📄 webhook.js             # 使用 API 路由接收 helius webhook 数据，并存入数据库
│
└── 📁 scripts/
    ├── 📄 heliusSetup.js         # 管理 helius 的 Webhook 订阅
    └── 📄 run.js                 # 运行 heliusSetup.js 文件
```









