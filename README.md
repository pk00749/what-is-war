# What is War - 全球战争日报

> "书本的历史滞后，但历史每天都在发生。"

记录全球每天战争情况的网站，让历史"实时发生"。

**在线访问**：https://war.yorkhxli.site

---

## 功能特性

- 🌍 **全球视野** - 追踪乌克兰、中东、美伊等热点地区
- 📊 **数据可视化** - 地图标记、统计图表、时间轴
- 🤖 **AI 日报** - Ollama 驱动的每日冲突摘要
- 🌐 **多语言** - 支持中文、英文、俄语、波斯语
- 📱 **响应式** - 适配桌面和移动端

---

## 快速部署

### 方式一：Vercel（推荐）

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 克隆项目
git clone https://github.com/pk00749/what-is-war.git
cd what-is-war

# 3. 配置环境变量
# 在 Vercel Dashboard 添加：
# - MAPBOX_TOKEN: Mapbox API Key（地图功能）

# 4. 部署
vercel --prod
```

或在 Vercel Dashboard：
1. 导入 `pk00749/what-is-war` 仓库
2. 添加环境变量 `MAPBOX_TOKEN`
3. Deploy

### 方式二：本地 Nginx

```bash
# 1. 安装依赖
npm install

# 2. 开发模式
npm run dev
# 访问 http://localhost:3000

# 3. 生产模式
npm run build
PORT=3001 npm start

# 4. Nginx 配置反向代理
```

Nginx 配置示例：
```nginx
server {
    listen 80;
    server_name war.yorkhxli.site;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name war.yorkhxli.site;

    ssl_certificate /etc/nginx/ssl/war.yorkhxli.crt;
    ssl_certificate_key /etc/nginx/ssl/war.yorkhxli.key;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 数据更新

### 自动更新（推荐）

项目使用 GitHub Actions 定时抓取 GDELT 数据，每日自动更新。

### 手动更新

```bash
cd what-is-war

# 安装 Python 依赖
pip install httpx

# 抓取 GDELT 数据
python scripts/fetch_gdelt.py

# 生成每日统计
python scripts/generate_stats.py
```

### 数据结构

```
data/
├── ukraine/           # 乌克兰数据
├── middle-east/       # 中东数据
├── us-iran/          # 美伊数据
└── stats/            # 每日统计
```

---

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 代码检查
npm run lint
```

### 添加 UI 组件

```bash
npx shadcn@latest add [component-name]
```

---

## 环境变量

| 变量 | 必需 | 说明 |
|------|------|------|
| `MAPBOX_TOKEN` | 是 | Mapbox API Key，用于地图显示 |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | 是 | 同上，客户端用 |

申请地址：https://www.mapbox.com/

---

## 技术栈

- **框架**：Next.js 16 + React 19
- **语言**：TypeScript
- **样式**：Tailwind CSS + shadcn/ui
- **地图**：Mapbox GL JS
- **国际化**：next-intl
- **部署**：Vercel / Nginx

---

## 页面路由

| 路由 | 说明 |
|------|------|
| `/` | 首页（自动跳转 `/zh-CN`） |
| `/zh-CN` | 中文首页 |
| `/zh-CN/ukraine` | 乌克兰详情 |
| `/zh-CN/middle-east` | 中东详情 |
| `/zh-CN/us-iran` | 美伊详情 |
| `/zh-CN/timeline` | 冲突时间轴 |
| `/zh-CN/humanitarian` | 人道主义追踪 |

---

## API 端点

| 端点 | 说明 |
|------|------|
| `GET /api/events` | 事件列表 |
| `GET /api/daily-summary` | 每日统计 |
| `GET /api/daily-summary-ai` | AI 生成摘要 |
| `GET /api/cumulative-stats` | 累计统计 |
| `GET /api/map/[region]` | 地图数据 |
| `GET /api/timeline/[region]` | 时间轴数据 |

---

## License

MIT
