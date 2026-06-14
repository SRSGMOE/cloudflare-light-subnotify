# Cloudflare Light Subnotify

基于 Cloudflare Pages + D1 数据库的轻量级订阅管理系统，支持 Telegram Bot、邮件、喵提醒多种通知渠道。

## ✨ 功能特性

### 核心功能
- 📊 **数据表盘**：实时时间显示、订阅统计、货币汇率
- 📋 **订阅管理**：卡片式布局，创建、编辑、删除、暂停订阅，支持收支记录
- 🔔 **通知设置**：统一管理 TG Bot、邮件、喵提醒配置
- ⚙️ **系统设置**：API路径配置、通知标题设置
- 🔒 **安全认证**：管理员用户名+密码登录
- 🌍 **多时区支持**：UTC、北京时间、美国东部
- 📱 **响应式设计**：支持桌面端、平板端、移动端

### 通知渠道
- 🤖 **TG Bot**：支持命令交互、自动通知
- 📧 **邮件通知**：SMTP 配置，支持多个收件人
- ⏰ **喵提醒**：通过喵码触发通知

### 收支管理
- 💰 **支出记录**：记录订阅支出金额
- 💵 **收入记录**：记录订阅收入金额
- 🌐 **多币种支持**：CNY / USD / EUR / JPY

### API 安全
- 🔐 **随机路径**：支持自定义随机路径保护 API
- 🎲 **一键生成**：支持随机生成18位路径
- 📋 **快速复制**：支持复制完整 API URL
- ⚡ **自动保存**：生成路径后自动保存到数据库

## 🚀 本地部署

### 前置条件

- Node.js 18+

### 步骤

```bash
# 1. 克隆项目
git clone https://github.com/SRSGMOE/cloudflare-light-subnotify.git
cd cloudflare-light-subnotify

# 2. 安装依赖
npm install

# 3. 本地开发
npm run dev

# 4. 构建项目
npm run build
```

## ☁️ 部署到 Cloudflare Pages

### 前置条件

- Cloudflare 账号
- GitHub 账号

### 1. Fork 仓库

1. 访问 [cloudflare-light-subnotify](https://github.com/SRSGMOE/cloudflare-light-subnotify)
2. 点击右上角 **Fork** 按钮

### 2. 创建 D1 数据库

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages** → **D1**
3. 点击 **Create database**
4. 数据库名称：`subnotify-db`

### 3. 创建 Pages 项目

1. 进入 **Workers & Pages** → **Create Application**
2. 选择 **Pages** → **Connect to Git**
3. 选择你 Fork 的 GitHub 仓库
4. 配置构建设置：

| 配置项 | 值 |
|--------|-----|
| **框架预设** | Vite |
| **构建命令** | `npm run build` |
| **输出目录** | `/dist` |
| **根目录** | `/` |

5. 点击 **Save and Deploy**

### 4. 配置环境变量

进入 Pages 项目 → **Settings** → **Environment variables**

| 变量名 | 值 | 类型 | 说明 |
|--------|-----|------|------|
| `ADMIN_USERNAME` | `admin` | Secret | 管理员用户名 |
| `ADMIN_PASSWORD` | `你的密码` | Secret | 管理员密码 |

### 5. 配置 D1 数据库绑定

1. 进入 Pages 项目 → **Settings** → **Functions**
2. 找到 **D1 database bindings**
3. 点击 **Add binding**
4. 配置：

| 配置项 | 值 |
|--------|-----|
| **Variable name** | `DB` |
| **D1 database** | 选择 `subnotify-db` |

5. 点击 **Save**

### 6. 重新部署

配置完成后，进入 **Deployments** 点击 **Deploy** 重新部署。

## 📖 使用指南

### 登录系统

1. 访问部署后的域名
2. 输入管理员用户名和密码
3. 点击登录

### 数据表盘

- 实时显示世界时钟、北京时间、美国东部时间
- 显示订阅统计数据：总订阅、活跃订阅、已停止订阅
- 显示货币汇率：美元、欧元、日元（支持手动刷新）

### 订阅管理

1. 点击「添加订阅」按钮
2. 填写订阅信息：
   - **名称**：订阅名称
   - **内容**：订阅描述
   - **周期类型**：每日/每周/每月/每年/指定日期
   - **通知时间**：小时和分钟
   - **时区**：选择对应时区
   - **通知途径**：选择通知渠道（可多选）
   - **收支类型**：支出/收入/无收支
   - **金额**：输入金额
   - **币种**：CNY/USD/EUR/JPY
3. 点击「保存」

### 通知设置

#### TG Bot 设置

1. 打开 Telegram 搜索 `@BotFather`
2. 发送 `/newbot` 创建 Bot
3. 获取 Bot Token
4. 在通知设置中填写 Bot Token
5. 点击「保存设置」（自动注册命令和设置 Webhook）
6. 添加 Chat ID（可添加多个）
7. 点击「测试」验证连接

#### 邮件通知设置

1. 配置 SMTP 服务器信息
2. 添加收件人邮箱
3. 点击「测试」验证发送

#### 喵提醒设置

1. 访问 [miaotixing.com](https://miaotixing.com) 获取喵码
2. 在通知设置中添加喵码
3. 点击「测试」验证触发

### 系统设置

#### API 路径设置

支持自定义随机路径保护 API，防止被滥用。

1. 点击「随机生成路径」按钮
2. 系统自动生成18位随机路径（大小写字母+数字）
3. 弹窗确认后自动保存到数据库
4. 使用复制按钮复制完整 API URL

#### 通知标题设置

自定义通知消息的标题，支持预览效果。

## 🤖 Telegram Bot 命令

| 命令 | 说明 | 冷却时间 |
|------|------|----------|
| `/start` | 开始使用 | 5 分钟 |
| `/status` | 查看系统状态 | 5 分钟 |

## 📋 通知格式示例

```
📢 订阅到期提醒

📦 订阅名称：示例订阅
🔖 订阅内容：这是订阅内容示例
💰 项目收支：支出 100 CNY
📮 通知周期：每周五 14:30
🌏 当前时区：北京时间 UTC+8
📆 下次通知：2024-01-12 14:30
```

## 📊 API 接口

### 认证相关

| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/api/auth/status` | GET | 检查是否需要认证 | ❌ |
| `/api/login` | POST | 登录 | ❌ |
| `/api/auth/verify` | POST | 验证 token | ❌ |

### 订阅管理

| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/api/subscriptions` | GET | 获取订阅列表 | ✅ |
| `/api/subscriptions` | POST | 创建订阅 | ✅ |
| `/api/subscriptions/:id` | PUT | 更新订阅 | ✅ |
| `/api/subscriptions/:id` | DELETE | 删除订阅 | ✅ |

### 通知设置

| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/api/telegram-settings` | GET | 获取 TG Bot 设置 | ✅ |
| `/api/telegram-settings` | POST | 保存 TG Bot 设置 | ✅ |
| `/api/test-telegram` | POST | 测试 TG Bot 连接 | ✅ |
| `/api/email-settings` | GET | 获取邮件设置 | ✅ |
| `/api/email-settings` | POST | 保存邮件设置 | ✅ |
| `/api/test-email` | POST | 测试邮件发送 | ✅ |
| `/api/miao-settings` | GET | 获取喵提醒设置 | ✅ |
| `/api/miao-settings` | POST | 保存喵提醒设置 | ✅ |
| `/api/test-miao` | POST | 测试喵提醒 | ✅ |

### 系统设置

| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/api/notify-settings` | GET | 获取通知标题设置 | ✅ |
| `/api/notify-settings` | POST | 保存通知标题设置 | ✅ |
| `/api/api-paths` | GET | 获取 API 路径设置 | ✅ |
| `/api/api-paths` | POST | 保存 API 路径设置 | ✅ |
| `/api/exchange-rate` | GET | 获取汇率 | ✅ |
| `/api/exchange-rate` | POST | 刷新汇率 | ✅ |

### 定时任务

| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
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
| notify_channels | TEXT | 通知途径（JSON） |
| finance_type | TEXT | 收支类型（none/expense/income） |
| finance_amount | TEXT | 收支金额 |
| finance_currency | TEXT | 币种（CNY/USD/EUR/JPY） |
| created_at | TEXT | 创建时间 |
| updated_at | TEXT | 更新时间 |
| is_active | INTEGER | 是否激活 |

### notify_settings 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| key | TEXT | 设置键名 |
| value | TEXT | 设置值 |

## ⏰ 定时通知配置

Cloudflare Pages Functions 不支持定时任务，需要通过外部服务触发。

### 方案1：使用独立 Worker（推荐）

```javascript
export default {
  async scheduled(event, env, ctx) {
    const API_URL = env.API_URL;
    if (!API_URL) return;
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    
    const result = await response.json();
    console.log('Result:', result);
  }
};
```

### 方案2：使用青龙面板

```bash
curl -X POST https://你的域名/随机路径/api/check-notifications
```

### 方案3：使用 UptimeRobot

- URL: `https://你的域名/随机路径/api/check-notifications`
- Method: `POST`
- 间隔: 10 分钟

### 汇率刷新

调用 API 刷新汇率：

```bash
curl -X POST https://你的域名/随机路径/api/exchange-rate
```

建议每天 UTC 0 点调用一次。

## 🔒 安全机制

### 管理员认证

- 用户名+密码登录
- Token 验证机制
- 环境变量加密存储

### API 路径保护

- 支持自定义随机路径
- 18位大小写字母+数字
- 防止 API 被滥用

### Telegram 命令冷却

- 同一命令每 5 分钟只能发送一次
- 防止命令被滥用

## 📝 更新日志

### v2.2.0

- ✅ 新增收支管理功能（支出/收入/无收支）
- ✅ 支持多币种（CNY/USD/EUR/JPY）
- ✅ 货币汇率显示优化
- ✅ 随机路径改为18位
- ✅ API路径自动生成并保存
- ✅ 页内弹窗确认

### v2.1.0

- ✅ 新增「通知设置」页面
- ✅ 系统设置新增 API 路径配置
- ✅ 支持随机路径保护 API
- ✅ 移除 API_PREFIX 环境变量
- ✅ 货币汇率支持外部定时刷新
- ✅ Bot /status 可刷新汇率

### v2.0.0

- ✅ React 重构
- ✅ animal-island-ui 组件库
- ✅ 双主题支持
- ✅ 多通知渠道支持
- ✅ 喵提醒集成
- ✅ 邮件通知支持

## 📄 许可证

MIT License

## 🔗 相关链接

- [项目地址](https://github.com/SRSGMOE/cloudflare-light-subnotify)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- [animal-island-ui](https://github.com/guokaigdg/animal-island-ui)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [喵提醒](https://miaotixing.com)
- [青龙面板](https://github.com/whyour/qinglong)

## 🛠️ 技术栈

| 技术 | 说明 |
|------|------|
| **前端** | React 18 + animal-island-ui |
| **后端** | Cloudflare Pages Functions |
| **数据库** | Cloudflare D1 (SQLite) |
| **构建工具** | Vite |
| **部署平台** | Cloudflare Pages |

## 💬 支持

如有问题，请提交 [Issue](https://github.com/SRSGMOE/cloudflare-light-subnotify/issues)