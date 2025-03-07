import fs from 'fs/promises';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';
import chalk from 'chalk';
import banner from './banner.js';
import readline from 'readline';

const API_ENDPOINT = 'https://api.dashboard.3dos.io/api/profile/api';
const DASHBOARD_API = 'https://api.dashboard.3dos.io/api/profile/me';
const DELAY_SECONDS = 60;
const HARVEST_FILE = 'harvest.json';
const SECRETS_FILE = 'secret.txt';
const TOKENS_FILE = 'token.txt';
const PROXY_FILE = 'proxy.txt';

// 创建readline接口
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Promise化的问题函数
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const delay = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

// 保存配置到文件
async function saveToFile(filePath, content) {
    try {
        await fs.writeFile(filePath, content, 'utf8');
        console.log(chalk.green(`✓ 成功保存到 ${filePath}`));
    } catch (error) {
        console.error(chalk.red(`保存到 ${filePath} 失败: ${error.message}`));
        throw error;
    }
}

// 获取用户输入的账户信息
async function getAccountInfo() {
    console.log(chalk.cyan('\n=== 账户配置 ==='));
    console.log(chalk.yellow('请按照提示输入您的账户信息。每个账户的Secret和Token请用回车分隔。'));
    console.log(chalk.yellow('当您输入完所有账户后，请直接按回车结束输入。\n'));

    const secrets = [];
    const tokens = [];
    let accountNum = 1;

    while (true) {
        console.log(chalk.cyan(`\n--- 账户 ${accountNum} ---`));
        const secret = await question(chalk.yellow('请输入Secret (直接按回车结束输入): '));
        
        if (!secret) break;
        
        const token = await question(chalk.yellow('请输入Token: '));
        if (!token) {
            console.log(chalk.red('Token不能为空，请重试'));
            continue;
        }

        secrets.push(secret);
        tokens.push(token);
        accountNum++;
    }

    return { secrets, tokens };
}

// 格式化代理地址
function formatProxyUrl(proxy) {
    try {
        // 如果已经是标准格式，直接返回
        if (proxy.startsWith('http://') || proxy.startsWith('https://') || 
            proxy.startsWith('socks4://') || proxy.startsWith('socks5://')) {
            return proxy;
        }

        // 移除空格
        proxy = proxy.trim();

        // 分割代理字符串
        let parts;
        
        // 处理包含@的格式 (用户名密码在前面)
        if (proxy.includes('@')) {
            const [auth, address] = proxy.split('@');
            if (auth && address) {
                const [username, password] = auth.split(':');
                const [ip, port] = address.split(':');
                if (username && password && ip && port) {
                    return `http://${username}:${password}@${ip}:${port}`;
                }
            }
        }
        
        // 处理用:分隔的格式
        parts = proxy.split(':');
        
        switch (parts.length) {
            case 2: // ip:port
                return `http://${parts[0]}:${parts[1]}`;
            
            case 3: // ip:port:protocol 或 ip:port:username
                if (['http', 'https', 'socks4', 'socks5'].includes(parts[2].toLowerCase())) {
                    return `${parts[2].toLowerCase()}://${parts[0]}:${parts[1]}`;
                } else {
                    return `http://${parts[2]}:@${parts[0]}:${parts[1]}`;
                }
            
            case 4: // ip:port:username:password
                return `http://${parts[2]}:${parts[3]}@${parts[0]}:${parts[1]}`;
            
            case 5: // protocol:ip:port:username:password
                if (['http', 'https', 'socks4', 'socks5'].includes(parts[0].toLowerCase())) {
                    return `${parts[0].toLowerCase()}://${parts[3]}:${parts[4]}@${parts[1]}:${parts[2]}`;
                }
                break;
        }

        // 如果是纯IP，尝试添加默认端口80
        if (/^(\d{1,3}\.){3}\d{1,3}$/.test(proxy)) {
            return `http://${proxy}:80`;
        }

        // 如果无法识别格式，返回原始值并添加http://
        return proxy.startsWith('http') ? proxy : `http://${proxy}`;
    } catch (error) {
        console.error(chalk.yellow(`代理格式无法解析: ${proxy}，将使用原始格式`));
        return proxy;
    }
}

// 获取代理配置
async function getProxyConfig() {
    console.log(chalk.cyan('\n=== 代理配置 ==='));
    console.log(chalk.yellow('请输入代理服务器地址，每行一个。直接按回车结束输入。'));
    console.log(chalk.yellow('支持的格式:'));
    console.log(chalk.yellow('  - ip:port'));
    console.log(chalk.yellow('  - ip:port:username:password'));
    console.log(chalk.yellow('  - ip:port:protocol'));
    console.log(chalk.yellow('  - protocol:ip:port:username:password'));
    console.log(chalk.yellow('  - username:password@ip:port'));
    console.log(chalk.yellow('  - http://username:password@ip:port'));
    console.log(chalk.yellow('  - socks4://ip:port'));
    console.log(chalk.yellow('  - socks5://username:password@ip:port'));
    console.log(chalk.yellow('  - 纯IP地址（将使用默认端口80）\n'));

    const proxies = [];
    while (true) {
        const proxy = await question(chalk.yellow('请输入代理地址 (直接按回车结束输入): '));
        if (!proxy) break;
        
        const formattedProxy = formatProxyUrl(proxy.trim());
        console.log(chalk.gray(`格式化后的代理地址: ${formattedProxy}`));
        proxies.push(formattedProxy);
    }

    return proxies;
}

// 获取收获数据
async function getHarvestData() {
    const harvestData = {
        url: "https://www.tokopedia.com/",
        harvestedData: "Download Tokopedia App\nTentang Tokopedia\nMitra Tokopedia\nMulai Berjualan\nPromo\nTokopedia Care\nKategori\nMasuk\nDaftar\nSamsung Note 10\nCharger Mobil\nSamsung A73\nPull Up Bar\nHdd 1tb\nXbox Series X\nKe slide 1\nKe slide 2\nKe slide 3\nKe slide 4\nKe slide 5\nLihat Promo Lainnya\nprev\nnext"
    };

    // 保存到文件
    await saveToFile(HARVEST_FILE, JSON.stringify(harvestData, null, 4));

    return harvestData;
}

// 修改初始化配置函数
async function initializeConfig() {
    try {
        console.log(banner);
        console.log(chalk.cyan('\n欢迎使用3DOS自动收获机器人！'));
        console.log(chalk.yellow('首次使用需要进行配置，请按照提示完成设置。\n'));

        // 获取账户信息
        const { secrets, tokens } = await getAccountInfo();
        if (secrets.length === 0) {
            throw new Error('未输入任何账户信息');
        }

        // 获取代理配置
        const proxies = await getProxyConfig();

        // 获取收获数据
        const harvestData = await getHarvestData();

        // 保存配置
        await saveToFile(SECRETS_FILE, secrets.join('\n'));
        await saveToFile(TOKENS_FILE, tokens.join('\n'));
        if (proxies.length > 0) {
            await saveToFile(PROXY_FILE, proxies.join('\n'));
        }

        console.log(chalk.green('\n✓ 配置完成！'));
        return { secrets, tokens, proxies, harvestData };
    } catch (error) {
        console.error(chalk.red(`配置过程出错: ${error.message}`));
        process.exit(1);
    }
}

// 读取文件内容并按行分割
async function readFileLines(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        return content.split('\n').filter(line => line.trim());
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

async function readProxies() {
    const proxies = await readFileLines(PROXY_FILE);
    return proxies.filter(proxy => proxy.trim());
}

async function readSecrets() {
    return await readFileLines(SECRETS_FILE);
}

async function readTokens() {
    return await readFileLines(TOKENS_FILE);
}

// 修改读取收获数据函数
async function readHarvestData() {
    try {
        const data = await fs.readFile(HARVEST_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(chalk.yellow('未找到收获数据配置，请输入新的配置。'));
            return await getHarvestData();
        }
        console.error(chalk.red(`读取收获文件错误: ${error.message}`));
        process.exit(1);
    }
}

function createProxyAgent(proxyUrl) {
    try {
        if (!proxyUrl) return null;
        
        if (proxyUrl.startsWith('socks4://') || proxyUrl.startsWith('socks5://')) {
            return new SocksProxyAgent(proxyUrl);
        } else {
            // 处理HTTP/HTTPS代理
            if (!proxyUrl.startsWith('http://') && !proxyUrl.startsWith('https://')) {
                proxyUrl = `http://${proxyUrl}`;
            }
            return new HttpsProxyAgent(proxyUrl);
        }
    } catch (error) {
        console.error(chalk.red(`创建代理代理实例错误: ${error.message}`));
        return null;
    }
}

function createAxiosInstance(proxyUrl = null) {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive'
        },
        timeout: 30000, // 30秒超时
        maxRetries: 3,  // 最大重试次数
        retryDelay: 1000 // 重试延迟（毫秒）
    };

    if (proxyUrl) {
        const proxyAgent = createProxyAgent(proxyUrl);
        if (proxyAgent) {
            config.httpsAgent = proxyAgent;
            config.httpAgent = proxyAgent;
        }
    }

    const instance = axios.create(config);

    // 添加重试逻辑
    instance.interceptors.response.use(undefined, async (err) => {
        const config = err.config;
        if (!config || !config.maxRetries) return Promise.reject(err);

        config.retryCount = config.retryCount ?? 0;
        if (config.retryCount >= config.maxRetries) {
            return Promise.reject(err);
        }

        config.retryCount += 1;
        const delay = config.retryDelay * config.retryCount;
        await new Promise(resolve => setTimeout(resolve, delay));
        return instance(config);
    });

    return instance;
}

async function getEarningsData(bearerToken, axiosInstance) {
    try {
        const response = await axiosInstance.post(DASHBOARD_API, {}, {
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'Origin': 'https://dashboard.3dos.io',
                'Referer': 'https://dashboard.3dos.io/'
            }
        });

        if (response.data.data) {
            const data = response.data.data;
            const todayEarning = parseInt(data.todays_earning) || 0;
            return {
                todaysEarning: {
                    tpoints: todayEarning,
                    date: new Date().toLocaleDateString()
                },
                loyaltyPoints: data.loyalty_points,
                username: data.username,
                currentTier: data.tier.tier_name
            };
        }
        throw new Error('无效的响应结构');
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        console.error(chalk.red(`获取收益数据错误: ${errorMessage}`));
        return null;
    }
}

async function sendHarvestedData(apiSecret, url, harvestData, axiosInstance) {
    try {
        const endpoint = `${API_ENDPOINT}/${apiSecret}`;
        const response = await axiosInstance.post(endpoint, {
            url: url,
            harvestedData: harvestData
        }, {
            headers: {
                "accept": "application/json, text/plain, */*",
                "accept-encoding": "gzip, deflate, br, zstd",
                "accept-language": "en-US,en;q=0.9",
                "authorization": `Bearer ${apiSecret}`,
                "cache-control": "no-cache",
                "content-type": "application/json",
                "origin": "https://dashboard.3dos.io",
                "pragma": "no-cache",
                "referer": "https://dashboard.3dos.io/register?ref_code=1c744d",
                "sec-ch-ua": '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"Linux"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
            }
        });
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        console.error(chalk.red(`发送数据错误: ${errorMessage}`));
        return null;
    }
}

function displayEarnings(earningsData, accountIndex) {
    if (earningsData) {
        const { todaysEarning, loyaltyPoints, username, currentTier } = earningsData;
        console.log(chalk.cyan(`\n[账户 ${accountIndex + 1}]`));
        console.log(chalk.cyan(`用户名: ${chalk.bold(username)} (${currentTier})`));
        console.log(chalk.cyan(`今日收益: ${chalk.bold(todaysEarning.tpoints)} 积分 (${todaysEarning.date})`));
        console.log(chalk.cyan(`总忠诚度积分: ${chalk.bold(loyaltyPoints)}`));
    }
}

async function harvestAccount(accountIndex, secret, token, harvestData, proxy) {
    try {
        const axiosInstance = createAxiosInstance(proxy);
        console.log(chalk.yellow(`[账户 ${accountIndex + 1}] 使用代理: ${proxy || '直接连接'}`));
        
        const harvestResult = await sendHarvestedData(secret, harvestData.url, harvestData.harvestedData, axiosInstance);
        if (harvestResult) {
            console.log(chalk.green(`✓ 账户 ${accountIndex + 1}: 收获数据发送成功`));
            const earningsData = await getEarningsData(token, axiosInstance);
            displayEarnings(earningsData, accountIndex);
        }
    } catch (error) {
        console.error(chalk.red(`[账户 ${accountIndex + 1}] 错误: ${error.message}`));
    }
}

async function continuousHarvest() {
    try {
        let secrets, tokens, proxies, harvestData;

        // 检查是否存在配置文件
        try {
            secrets = await readSecrets();
            tokens = await readTokens();
            proxies = await readProxies();
            harvestData = await readHarvestData();

            if (secrets.length === 0 || tokens.length === 0) {
                throw new Error('配置文件为空');
            }
        } catch (error) {
            // 如果配置文件不存在或为空，进行初始化配置
            const config = await initializeConfig();
            secrets = config.secrets;
            tokens = config.tokens;
            proxies = config.proxies;
            harvestData = config.harvestData;
        }

        if (secrets.length !== tokens.length) {
            throw new Error('密钥和令牌的数量不匹配');
        }

        console.log(chalk.bold(`\n开始持续收获 ${secrets.length} 个账户，间隔 ${DELAY_SECONDS} 秒...`));
        console.log(chalk.bold(`已加载 ${proxies.length} 个代理`));
        console.log(chalk.bold(`目标网站: ${harvestData.url}`));

        while (true) {
            const timestamp = new Date().toLocaleString();
            console.log(chalk.yellow('\n═══════════════════════════════════════════'));
            console.log(chalk.bold(`[${timestamp}] 开始收获周期`));

            for (let i = 0; i < secrets.length; i++) {
                const proxy = proxies.length > 0 ? proxies[i % proxies.length] : null;
                await harvestAccount(i, secrets[i].trim(), tokens[i].trim(), harvestData, proxy);

                if (i < secrets.length - 1) {
                    await delay(5);
                }
            }

            console.log(chalk.yellow(`\n等待 ${DELAY_SECONDS} 秒后进行下一次收获...`));
            await delay(DELAY_SECONDS);
        }
    } catch (error) {
        console.error(chalk.red(`致命错误: ${error.message}`));
        process.exit(1);
    } finally {
        rl.close();
    }
}

// 优雅退出处理
process.on('SIGINT', () => {
    console.log(chalk.bold('\n正在优雅关闭...'));
    rl.close();
    process.exit(0);
});

// 启动程序
console.log(banner);
continuousHarvest();