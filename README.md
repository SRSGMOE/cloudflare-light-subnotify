# Cloudflare Light Subnotify

基于 Cloudflare Pages + D1 数据库的轻量级订阅管理系统，支持 Telegram Bot 通知。

使用 React + animal-island-ui 构建，提供原汁原味的动物森林风格 UI。

## 技术栈

- **前端**: React 18 + animal-island-ui
- **后端**: Cloudflare Pages Functions
- **数据库**: Cloudflare D1 (SQLite)
- **构建工具**: Vite
- **部署**: Cloudflare Pages

## 项目结构

```
subnotify-refactored/
├── src/
│   ├── main.jsx              # React 入口
│   ├── App.jsx               # 主应用组件
│   ├── api/
│   │   └── index.js          # API 请求封装
│   └── pages/
│       ├── LoginPage.jsx     # 登录页面
│       ├── DashboardPage.jsx # 数据表盘
│       ├── SubscriptionPage.jsx # 订阅管理
│       └── SettingsPage.jsx  # 系统设置
├── functions/
│   ├── api/
│   │   └── [[path]].js       # API 路由处理
│   └── webhook/
│       └── telegram.js       # Telegram Webhook
├── index.html                # HTML 入口
├── package.json              # 项目配置
├── vite.config.js            # Vite 配置
└── wrangler.toml             # Cloudflare 配置
```

## 部署步骤

### 1. 创建 D1 数据库

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages** → **D1**
3. 创建数据库，名称：`subnotify-db`
4. 记录数据库 ID

### 2. 创建 Pages 项目

1. 进入 **Workers & Pages** → **Create Application**
2. 选择 **Pages** → **Connect to Git**
3. 选择 GitHub 仓库：`SRSGMOE/cloudflare-light-subnotify`
4. 配置构建设置：
   - **构建命令**: `npm run build`
   - **输出目录**: `dist`
5. 点击 **Save and Deploy**

### 3. 配置 D1 数据库绑定

1. 进入 Pages 项目 → **Settings** → **Functions**
2. 找到 **D1 database bindings**
3. 点击 **Add binding**
4. 填写：
   - **Variable name**: `DB`
   - **D1 database**: 选择 `subnotify-db`
5. 点击 **Save**

### 4. 设置环境变量

1. 进入 Pages 项目 → **Settings** → **Environment variables**
2. 添加变量：
   - `ADMIN_USERNAME` = `admin`
   - `ADMIN_PASSWORD` = `你的密码`（加密）
3. 点击 **Save**

### 5. 重新部署

配置完成后，重新部署以使绑定生效。

## 本地开发

```bash
# 安装依赖
npm install

# 创建本地环境变量文件 .dev.vars
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password

# 启动本地开发服务器
npm run dev
```

## 功能特性

- ✅ React + animal-island-ui 原版 UI
- ✅ 左侧导航布局
- ✅ 数据表盘：实时时间和订阅统计
- ✅ 订阅管理：CRUD 操作
- ✅ 系统设置：Telegram Bot 配置
- ✅ 通知标题设置和预览
- ✅ Telegram Bot 命令支持
- ✅ 管理员用户名+密码登录

## Telegram Bot 命令

| 命令 | 说明 |
|------|------|
| `/start` | 开始使用 |
| `/help` | 查看帮助 |
| `/list` | 查看订阅列表 |
| `/today` | 查看今日待通知 |
| `/status` | 查看系统状态 |

## 许可证

MIT