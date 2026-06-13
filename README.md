# Cloudflare Light Subnotify

基于 Cloudflare Pages + D1 数据库的轻量级订阅管理系统，支持 Telegram Bot、邮件、喵提醒多种通知渠道。

## ✨ 功能特性

### 核心功能
- 📊 **数据表盘**：实时时间显示、订阅统计数据
- 📋 **订阅管理**：卡片式布局，创建、编辑、删除、暂停订阅
- ⚙️ **系统设置**：统一管理所有通知渠道配置
- 🔒 **安全认证**：管理员用户名+密码登录
- 🌍 **多时区支持**：UTC、北京时间、美国东部
- 📱 **响应式设计**：支持桌面端、平板端、移动端

### 通知渠道
- 🤖 **TG Bot**：支持命令交互、自动通知
- 📧 **邮件通知**：SMTP 配置，支持多个收件人
- ⏰ **喵提醒**：通过喵码触发通知（miaotixing.com）

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

访问 `http://localhost:5173` 查看效果。

## ☁️ 部署到 Cloudflare Pages

### 前置条件

- Cloudflare 账号
- GitHub 账号

### 1. Fork 仓库

1. 访问 [cloudflare-light-subnotify](https://github.com/SRSGMOE/cloudflare-light-subnotify)
2. 点击右上角 **Fork** 按钮
3. 将仓库 Fork 到你的 GitHub 账号

### 2. 创建 D1 数据库

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages** → **D1**
3. 点击 **Create database**
4. 数据库名称：`subnotify-db`
5. 记录数据库 ID

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
| `API_PREFIX` | `随机字符串` | Secret | API 路径前缀（可选） |

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

## 🔐 随机地址配置

为防止 API 被滥用，支持通过环境变量设置随机路径前缀。

### 配置方法

1. 生成随机字符串：
   ```bash
   openssl rand -hex 16
   # 输出示例: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   ```

2. 在 Cloudflare Dashboard 设置环境变量：
   - 变量名：`API_PREFIX`
   - 值：`a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
   - 类型：`Secret`

3. 重新部署项目

### 效果说明

| 场景 | 结果 |
|------|------|
| 未配置 API_PREFIX | API 正常访问：`/api/check-notifications` |
| 已配置 API_PREFIX | 必须带前缀：`/a1b2c3d4.../api/check-notifications` |
| 无前缀直接访问 | 返回 404，不消耗请求次数 |

## 📖 使用指南

### 登录系统

1. 访问部署后的域名
2. 输入管理员用户名和密码
3. 点击登录

### 数据表盘

- 实时显示世界时钟、北京时间、美国东部时间
- 显示订阅统计数据：总订阅、活跃订阅、已停止订阅

### 订阅管理

1. 点击「添加订阅」按钮
2. 填写订阅信息：
   - **名称**：订阅名称
   - **内容**：订阅描述
   - **周期类型**：每日/每周/每月/每年/指定日期
   - **通知时间**：小时和分钟
   - **时区**：选择对应时区
   - **通知途径**：选择通知渠道（可多选）
3. 点击「保存」

### 系统设置

#### TG Bot 设置

1. 打开 Telegram 搜索 `@BotFather`
2. 发送 `/newbot` 创建 Bot
3. 获取 Bot Token
4. 在系统设置中填写 Bot Token
5. 点击「保存设置」（自动注册命令和设置 Webhook）
6. 添加 Chat ID（可添加多个）
7. 点击「测试」验证连接

#### 邮件通知设置

1. 配置 SMTP 服务器信息
2. 添加收件人邮箱
3. 点击「测试」验证发送

#### 喵提醒设置

1. 访问 [miaotixing.com](https://miaotixing.com) 获取喵码
2. 在系统设置中添加喵码
3. 点击「测试」验证触发

#### 通知标题设置

自定义通知消息的标题，支持预览效果。

## 🤖 Telegram Bot 命令

| 命令 | 说明 | 冷却时间 |
|------|------|----------|
| `/start` | 开始使用，显示帮助信息 | 5 分钟 |
| `/status` | 查看系统状态 | 5 分钟 |

## 📋 通知格式示例

```
📢 订阅到期提醒

📦 订阅名称：示例订阅
🔖 订阅内容：这是订阅内容示例
🌏 当前时区：北京时间 UTC+8
📮 通知周期：每周五 14:30
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

### TG Bot 设置

| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/api/telegram-settings` | GET | 获取 Telegram 设置 | ✅ |
| `/api/telegram-settings` | POST | 保存 Telegram 设置 | ✅ |
| `/api/test-telegram` | POST | 测试 Telegram 连接 | ✅ |

### 邮件设置

| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/api/email-settings` | GET | 获取邮件设置 | ✅ |
| `/api/email-settings` | POST | 保存邮件设置 | ✅ |
| `/api/test-email` | POST | 测试邮件发送 | ✅ |

### 喵提醒设置

| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/api/miao-settings` | GET | 获取喵提醒设置 | ✅ |
| `/api/miao-settings` | POST | 保存喵提醒设置 | ✅ |
| `/api/test-miao` | POST | 测试喵提醒 | ✅ |

### 通知设置

| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/api/notify-settings` | GET | 获取通知标题设置 | ✅ |
| `/api/notify-settings` | POST | 保存通知标题设置 | ✅ |

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

创建一个独立的 Cloudflare Worker 来定时调用 API。

#### Worker 代码

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

#### wrangler.toml

```toml
name = "subnotify-scheduler"
main = "worker.js"
compatibility_date = "2024-12-01"

[triggers]
crons = ["*/10 * * * *"]
```

#### 环境变量

| 变量名 | 值 |
|--------|-----|
| `API_URL` | `https://你的域名.pages.dev/api/check-notifications` |

### 方案2：使用 UptimeRobot

1. 注册 [UptimeRobot](https://uptimerobot.com)
2. 创建 HTTP 监控器
3. URL：`https://你的域名.pages.dev/api/check-notifications`
4. 间隔：10 分钟

### 方案3：使用青龙面板

[青龙面板](https://github.com/whyour/qinglong) 是一个定时任务管理面板，支持多种脚本运行。

#### 安装青龙面板

```bash
docker run -dit \
  --name qinglong \
  --restart always \
  -p 5700:5700 \
  -v /opt/qinglong:/ql/data \
  whyour/qinglong:latest
```

访问 `http://你的IP:5700` 进入面板。

#### 创建定时任务

1. 进入青龙面板 → **定时任务** → **新建任务**
2. 配置任务：

| 配置项 | 值 |
|--------|-----|
| **名称** | 订阅通知检查 |
| **命令** | 见下方脚本 |
| **定时规则** | `0 */10 * * *`（每10分钟） |

3. 点击 **确定**

#### 通知检查脚本

创建文件 `/ql/data/scripts/check_notifications.sh`：

```bash
#!/bin/bash

# 配置你的 API 地址
# 如果配置了 API_PREFIX，需要包含前缀
# 例如: https://xxx.pages.dev/abc123/api/check-notifications
API_URL="https://你的域名.pages.dev/api/check-notifications"

# 发送请求
response=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{}')

# 输出结果
echo "通知检查结果: $response"
```

或者使用 Python 脚本 `check_notifications.py`：

```python
#!/usr/bin/env python3
import requests
import json

# 配置你的 API 地址
# 如果配置了 API_PREFIX，需要包含前缀
API_URL = "https://你的域名.pages.dev/api/check-notifications"

try:
    response = requests.post(API_URL, json={}, timeout=30)
    result = response.json()
    print(f"通知检查结果: {result}")
except Exception as e:
    print(f"请求失败: {e}")
```

#### 使用青龙面板的优势

- ✅ 免费开源
- ✅ 可视化管理
- ✅ 支持多种脚本（Shell、Python、Node.js 等）
- ✅ 支持任务日志查看
- ✅ 支持任务失败通知

## 🔒 安全机制

### 管理员认证

- 用户名+密码登录
- Token 验证机制
- 环境变量加密存储

### Telegram 命令冷却

- 同一命令每 5 分钟只能发送一次
- 防止命令被滥用

### 定时任务安全

- 通过独立 Worker 触发
- 可配置随机路径前缀隐藏 API

## 📝 更新日志

### v2.0.0

- ✅ React 重构
- ✅ animal-island-ui 组件库
- ✅ 双主题支持
- ✅ 左侧导航布局
- ✅ 卡片式订阅管理
- ✅ Toast 提示组件
- ✅ 确认弹窗组件
- ✅ 多通知渠道支持
- ✅ 喵提醒集成
- ✅ 邮件通知支持
- ✅ Telegram 命令冷却
- ✅ 通知途径选择
- ✅ 响应式设计

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
- [UptimeRobot](https://uptimerobot.com)

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