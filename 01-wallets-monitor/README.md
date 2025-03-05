# Track 100K Solana Wallets at Zero Cost  

As an on-chain trader, I’ve tried many wallet-tracking tools but found them lacking. Most can’t track more than 300 wallets, far from enough. So I built a powerful signal monitoring system that can theoretically track 100K wallets and process 500K transactions per month. To filter noise and extract real alpha, I integrated market cap and other filters based on my trading strategies. I also used DeepSeek to auto summarize related tweets. Now, trading feels much smoother.  

![screenshot](https://github.com/QuantVela/build-your-onchain-agent/blob/main/img/01screenshot.png)

The entire system runs at near zero cost using:  
- **Helius Webhooks** for wallet activity tracking  
- **Vercel API routes** to deploy the server  
- **Supabase** for storage and real-time WebSocket transaction monitoring  
- **Shyft** to parse transactions Helius can't, like Pumpfun and Metaora pools  
- **DeepSeek** for automatic tweet summaries  
- **Telegram Bot** to send trading signals

## How to Use
### Step 1: Environment Setup
1. Download the repository
```
git clone https://github.com/QuantVela/build-your-onchain-agent.git 01-wallets-monitor/wallets-monitor
```
2. Install dependencies
```
npm install
```
3. Configure environment variables
Copy `.env.example` to `.env` and fill in your API Keys
- [Helius](https://dashboard.helius.dev/dashboard) API Key and RPC endpoint
- [Supabase](https://supabase.com/) URL and Key
- [Shyft](https://shyft.to/) API Key
- [DeepSeek](https://platform.deepseek.com/) API Key
- [Telegram Bot](https://t.me/BotFather) Bot Token and Channel ID or Chat ID
- [RapidAPI](https://rapidapi.com/alexanderxbx/api/twitter-api45) API Key after subscribing to Twitter API Basic

### Step 2: Database Setup
1. Create database tables
- Log in to Supabase console and go to SQL Editor
- Execute SQL statements in `schema.sql` to create two tables: `txs` and `wallets`
- Upload your wallet list to the `wallets` table using SQL script or CSV import

2. Enable Supabase Realtime
- Enable Realtime for `txs` table: Go to Supabase console, Database -> Publications -> Enable Insert option for supabase_realtime row, and enable `txs` table in source

### Step 3: Deployment and Running
1. Local testing
```
npm run dev
```
2. Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel
```
- Log in to Vercel console and select your project
- Go to `Settings` -> `Environment Variables`, add SUPABASE_URL and SUPABASE_KEY
- Deploy to production
```
vercel --prod
```
- Find the Domains URL in Project, something like `https://your-project-name.vercel.app`

3. Configure Helius Webhook
- Modify `WEBHOOK_URL` in `.env` to your Webhook URL, like `https://your-project-name.vercel.app/api/route`
- Run `scripts/run.js` to set wallet addresses from supabase `wallets` table as Webhook subscription addresses
- Check Vercel Logs, expect to see 200 ok logs when subscribed wallets have new transactions, and "Successfully processed and stored with parser" in Messages

4. Start Monitoring
- `src/strategy/index.js` currently contains the basic strategy: when multiple wallets buy the same token within 6 hours, and the token has a market cap over 100k and was created within 7 days, it triggers a Telegram notification. You can modify this to your own strategy.
- Run `src/strategy/index.js` to start monitoring

## Webhook and Websocket
Polling is like calling an intern every minute to ask: any alpha? Webhook is like having the intern call you when there's alpha, and Websocket is like maintaining an ongoing voice call with the intern.

In the Helius scenario, webhooks have a few hundred milliseconds more latency than private RPC nodes, but my strategy doesn't require that level of speed. If you need auto-sniping or copy trading within the same block, consider using specialized tools or renting the $499 Yellowstone RPC.

## Project Structure
```
📁 Root Directory
├── 📁 src/
│   ├── 📁 strategy/
│   │   ├── 📄 index.js           # Monitor new transactions in database, check strategy conditions, send signals
│   │   └── 📄 messageTemplate.js # Message template for Telegram notifications         
│   │
│   └── 📁 utils/
│       ├── 📄 aiSummary.js       # Auto-summarize token-related tweets using deepseek
│       ├── 📄 dexscreener.js     # Get token information using dexscreener
│       ├── 📄 telegram.js        # Send Telegram messages
│       ├── 📄 tweetApi.js        # Search tweets and browse account content using rapidapi
│       ├── 📄 txsAnalyzer.js     # Calculate average purchase cost and position ratio for wallet portfolio
│       ├── 📄 solPrice.js        # Cache SOL price for better performance, update every 10 minutes
│       ├── 📄 txParser.js        # Use shyft to parse swaps that helius can't parse, like pumpfun internal trades
│       └── 📄 swapProcessor.js   # Process helius-parsed swap transactions into database structure
│
├── 📁 pages/api
│   └── 📄 webhook.js             # Use API routes to receive helius webhook data and store in database
│
└── 📁 scripts/
    ├── 📄 heliusSetup.js         # Manage helius Webhook subscriptions
    └── 📄 run.js                 # Run heliusSetup.js file
```