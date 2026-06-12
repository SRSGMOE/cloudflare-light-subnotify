# Cloudflare Light Subnotify

基于 Cloudflare Pages + D1 数据库的轻量级订阅管理系统，支持 Telegram Bot 通知。

使用 React 构建，支持动物森林主题和默认主题切换。

## ✨ 功能特性

- 🎨 **双主题支持**：动物森林风格 / 默认蓝白风格
- 📊 **数据表盘**：实时时间显示、订阅统计
- 📋 **订阅管理**：创建、编辑、删除、暂停订阅
- ⚙️ **系统设置**：Telegram Bot 配置、通知标题设置
- 🤖 **Telegram Bot**：支持命令交互、自动通知
- 🔒 **安全认证**：管理员用户名+密码登录
- 🌍 **多时区支持**：UTC、北京时间、美国东部
- 📱 **响应式设计**：支持移动端访问

## 📸 主题预览

### 动物森林主题
- 🌿 温暖自然的配色
- 🎮 animal-island-ui 图标
- ✨ bounce 弹跳动画
- 🎯 立体按钮效果

### 默认主题
- 💎 简洁现代的蓝白配色
- 📝 标准 emoji 图标
- 🎯 平面按钮设计
- ⚡ 流畅的交互体验

## 🛠️ 技术栈

| 技术 | 说明 |
|------|------|
| **前端** | React 18 |
| **UI 组件** | animal-island-ui（动物森林主题） |
| **后端** | Cloudflare Pages Functions |
| **数据库** | Cloudflare D1 (SQLite) |
| **构建工具** | Vite |
| **部署平台** | Cloudflare Pages |

## 📁 项目结构

```
subnotify-refactored/
├── functions/
│   ├── api/
│   │   └── [[path]].js      # API 路由处理
│   └── _middleware.js        # 中间件（随机路径前缀）
├── src/
│   ├── api/
│   │   └── index.js          # API 请求封装
│   ├── components/
│   │   ├── ErrorBoundary.jsx # 错误边界组件
│   │   └── Toast.jsx         # Toast 提示组件
│   ├── context/
│   │   └── ThemeContext.jsx  # 主题上下文
│   ├── hooks/
│   │   └── useToast.js       # Toast Hook
│   ├── pages/
│   │   ├── LoginPage.jsx     # 登录页面
│   │   ├── DashboardPage.jsx # 数据表盘
│   │   ├── SubscriptionPage.jsx # 订阅管理
│   │   └── SettingsPage.jsx  # 系统设置
│   ├── styles/
│   │   ├── global.css        # 全局样式（动物森林主题）
│   │   └── default-theme.css # 默认主题样式
│   ├── App.jsx               # 主应用组件
│   └── main.jsx              # 入口文件
├── index.html                # HTML 入口
├── package.json              # 项目配置
├── vite.config.js            # Vite 配置
├── wrangler.toml             # Cloudflare 配置
├── WORKER_SCHEDULER.md       # 定时任务 Worker 部署指南
└── README.md                 # 项目说明
```

## 🚀 快速开始

### 前置条件

- Node.js 18+
- Cloudflare 账号
- Telegram Bot（可选）

### 1. 克隆项目

```bash
git clone https://github.com/SRSGMOE/cloudflare-light-subnotify.git
cd cloudflare-light-subnotify
```

### 2. 安装依赖

```bash
npm install
```

### 3. 本地开发

```bash
npm run dev
```

访问 `http://localhost:5173` 查看效果。

### 4. 构建项目

```bash
npm run build
```

## ☁️ 部署到 Cloudflare Pages

### 1. 创建 D1 数据库

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages** → **D1**
3. 点击 **Create database**
4. 数据库名称：`subnotify-db`
5. 记录数据库 ID

### 2. 创建 Pages 项目

1. 进入 **Workers & Pages** → **Create Application**
2. 选择 **Pages** → **Connect to Git**
3. 选择 GitHub 仓库
4. 配置构建设置：

| 配置项 | 值 |
|--------|-----|
| **框架预设** | Vite |
| **构建命令** | `npm run build` |
| **输出目录** | `dist` |

5. 点击 **Save and Deploy**

### 3. 配置环境变量

进入 Pages 项目 → **Settings** → **Environment variables**

#### 必填变量

| 变量名 | 值 | 类型 | 说明 |
|--------|-----|------|------|
| `ADMIN_USERNAME` | `admin` | Text | 管理员用户名 |
| `ADMIN_PASSWORD` | `你的密码` | Secret | 管理员密码 |

#### 可选变量

| 变量名 | 值 | 类型 | 说明 |
|--------|-----|------|------|
| `API_PREFIX` | `随机字符串` | Secret | 定时任务随机路径前缀 |

### 4. 配置 D1 数据库绑定

1. 进入 Pages 项目 → **Settings** → **Functions**
2. 找到 **D1 database bindings**
3. 点击 **Add binding**
4. 配置：

| 配置项 | 值 |
|--------|-----|
| **Variable name** | `DB` |
| **D1 database** | 选择 `subnotify-db` |

5. 点击 **Save**

### 5. 重新部署

配置完成后，进入 **Deployments** 点击 **Deploy** 重新部署。

## 🤖 Telegram Bot 配置

### 1. 创建 Bot

1. 在 Telegram 搜索 `@BotFather`
2. 发送 `/newbot`
3. 按提示创建 Bot
4. 记录 Bot Token

### 2. 获取 Chat ID

1. 向 Bot 发送任意消息
2. 访问：`https://api.telegram.org/bot<你的TOKEN>/getUpdates`
3. 在返回的 JSON 中找到 `chat.id`

### 3. 在后台配置

1. 登录管理后台
2. 进入 **系统设置**
3. 填写 Bot Token 和 Chat ID
4. 点击 **保存设置**
5. 点击 **连通测试** 验证连接

### 4. Telegram 命令

| 命令 | 说明 |
|------|------|
| `/start` | 开始使用 |
| `/help` | 查看帮助 |
| `/list` | 查看订阅列表 |
| `/today` | 查看今日待通知 |
| `/status` | 查看系统状态 |

### 5. 通知格式示例

```
📢 订阅到期提醒

📦 - 订阅名称：示例订阅
🔖 - 订阅内容：这是订阅内容示例
🌏 - 当前时区：北京时间 UTC+8
📮 - 通知周期：每周五 14:30
📆 - 下次通知：2024-01-12 14:30
```

## ⏰ 定时通知配置

Cloudflare Pages Functions 不支持定时任务，需要通过外部服务触发。

### 方案1：使用 Worker（推荐）

参考 [WORKER_SCHEDULER.md](./WORKER_SCHEDULER.md) 创建独立的定时任务 Worker。

### 方案2：使用 UptimeRobot

1. 注册 [UptimeRobot](https://uptimerobot.com)
2. 创建 HTTP 监控器
3. URL：`https://你的域名.pages.dev/随机前缀/api/check-notifications`
4. 间隔：10 分钟

## 📊 API 接口

| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/api/auth/status` | GET | 检查是否需要认证 | ❌ |
| `/api/login` | POST | 登录 | ❌ |
| `/api/auth/verify` | POST | 验证 token | ❌ |
| `/api/subscriptions` | GET | 获取订阅列表 | ✅ |
| `/api/subscriptions` | POST | 创建订阅 | ✅ |
| `/api/subscriptions/:id` | PUT | 更新订阅 | ✅ |
| `/api/subscriptions/:id` | DELETE | 删除订阅 | ✅ |
| `/api/telegram-settings` | GET | 获取 Telegram 设置 | ✅ |
| `/api/telegram-settings` | POST | 保存 Telegram 设置 | ✅ |
| `/api/test-telegram` | POST | 测试 Telegram 连接 | ✅ |
| `/api/notify-settings` | GET | 获取通知设置 | ✅ |
| `/api/notify-settings` | POST | 保存通知设置 | ✅ |
| `/api/test-notify` | POST | 测试通知 | ✅ |
| `/api/check-notifications` | POST | 触发通知检查 | 🔒 |

## 🗄️ 数据库结构

### subscriptions 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| name | TEXT | 订阅名称 |
| content | TEXT | 订阅内容 |
| cycle_type | TEXT | 周期类型 |
| cycle_value | TEXT | 周期值 |
| cycle_hour | TEXT | 通知小时 |
| cycle_minute | TEXT | 通知分钟 |
| timezone | TEXT | 时区 |
| next_notify_date | TEXT | 下次通知日期 |
| is_active | INTEGER | 是否激活 |

### notify_settings 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| key | TEXT | 设置键名 |
| value | TEXT | 设置值 |

## 🎨 主题说明

### 动物森林主题

- 使用 animal-island-ui 组件库
- 圆润的 UI 风格
- 立体按钮效果
- bounce 弹跳动画
- 温暖自然的配色

### 默认主题

- 标准 UI 风格
- 平面按钮设计
- 蓝白配色
- 简洁现代

## 🔒 安全机制

### 随机路径前缀

通过环境变量 `API_PREFIX` 设置随机路径前缀，隐藏 API 真实路径：

```
真实路径: /api/check-notifications
隐藏路径: /a1b2c3d4e5f6g7h8/api/check-notifications
```

- 扫描工具无法猜到随机前缀
- 错误路径返回 404，不消耗请求次数

### 管理员认证

- 用户名+密码登录
- Token 验证机制
- 环境变量加密存储

## 📝 更新日志

### v2.0.0

- ✅ React 重构
- ✅ 双主题支持
- ✅ animal-island-ui 图标
- ✅ bounce 弹跳动画
- ✅ Toast 提示组件
- ✅ 随机路径安全机制
- ✅ 定时任务 Worker 支持

## 📄 许可证

MIT License

## 🔗 相关链接

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- [animal-island-ui](https://github.com/guokaigdg/animal-island-ui)
- [Telegram Bot API](https://core.telegram.org/bots/api)

## 💬 支持

如有问题，请提交 [Issue](https://github.com/SRSGMOE/cloudflare-light-subnotify/issues)