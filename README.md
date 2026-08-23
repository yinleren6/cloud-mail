> [!IMPORTANT]
> 本项目基于 [maillab/cloud-mail](https://github.com/maillab/cloud-mail) 修改,主要变更:
>
> - **通知系统插件化重构**: 新增 企业微信群 / 钉钉群 /飞书群 / OneBot / Telegram / Webhook 通知方式,支持自定义 Headers、Body 模板变量、Content-Type
> - **邮件自动匹配功能**: 支持一键匹配邮件到对应邮箱
> - **插件架构**: 通知系统与迁移系统采用插件化设计，核心文件仅 4 行改动，便于同步上游

<p align="center">
    <img src="doc/demo/logo.png" width="80px" />
    <h1 align="center">Cloud Mail</h1>
    <p align="center">基于 Cloudflare 的简约响应式邮箱服务，支持邮件发送、附件收发 🎉</p> 
    <p align="center">
        简体中文 | <a href="/README-en.md" style="margin-left: 5px">English </a>
    </p>
    <p align="center">
        <a href="https://github.com/maillab/cloud-mail/tree/main?tab=MIT-1-ov-file" target="_blank" >
            <img src="https://img.shields.io/badge/license-GPLv3-blue" />
        </a>    
        <a href="https://github.com/maillab/cloud-mail/releases" target="_blank" >
            <img src="https://img.shields.io/github/v/release/maillab/cloud-mail" alt="releases" />
        </a>  
        <a href="https://github.com/maillab/cloud-mail/issues" >
            <img src="https://img.shields.io/github/issues/maillab/cloud-mail" alt="issues" />
        </a>  
        <a href="https://github.com/maillab/cloud-mail/stargazers" target="_blank">
            <img src="https://img.shields.io/github/stars/maillab/cloud-mail" alt="stargazers" />
        </a>  
        <a href="https://github.com/maillab/cloud-mail/forks" target="_blank" >
            <img src="https://img.shields.io/github/forks/maillab/cloud-mail" alt="forks" />
        </a>
    </p>
    <p align="center">
        <a href="https://trendshift.io/repositories/20459" target="_blank" >
            <img src="https://trendshift.io/api/badge/repositories/20459" alt="trendshift" >
        </a>
    </p>
</p>

## 项目简介

只需要一个域名，就可以创建多个不同的邮箱，类似各大邮箱平台，本项目支持署到 Cloudflare Workers ，降低服务器成本，搭建自己的邮箱服务

## 项目展示

- [在线演示](https://skymail.ink)<br>
- [部署文档](https://doc.skymail.ink)<br>

| ![](/doc/demo/demo1.png) | ![](/doc/demo/demo2.png) |
| ------------------------ | ------------------------ |
| ![](/doc/demo/demo3.png) | ![](/doc/demo/demo4.png) |

## 功能介绍

- **💰 低成本使用**： 可部署到 Cloudflare Workers 降低服务器成本

- **💻 响应式设计**：响应式布局自动适配PC和大部分手机端浏览器

- **📧 邮件发送**：集成Resend发送邮件，支持群发，内嵌图片和附件发送，发送状态查看

- **🛡️ 管理员功能**：可以对用户，邮件进行管理，RABC权限控制对功能及使用资源限制

- **📦 附件收发**：支持收发附件，使用R2对象存储保存和下载文件

- **🔔 邮件推送**：接收邮件后可以转发到TG机器人或其他服务商邮箱

- **📡 开放API**：支持使用API批量生成用户，多条件查询邮件

- **🔢 验证码识别**：使用Workers AI，自动识别邮件验证码

- **📈 数据可视化**：使用ECharts对系统数据详情，用户邮件增长可视化显示

- **🎨 个性化设置**：可以自定义网站标题，登录背景，透明度

- **🤖 人机验证**：集成Turnstile人机验证，防止人机批量注册

- **📜 更多功能**：正在开发中...

## 本项目新增功能

### 通知系统

插件化架构，支持 6 种通知渠道：

- [x] 企业微信群通知 _[如何获取 Webhook 地址](https://cloud.tencent.com/document/product/1759/128391)_
- [x] 钉钉群 _[如何获取 Webhook 地址](https://open.dingtalk.com/document/robots/custom-robot-access)_
- [x] 飞书群 _[如何获取 Webhook 地址](https://open.feishu.cn/document/client-docs/bot-v3/add-custom-bot)_
- [x] OneBot (QQ) - 支持反向 WebSocket
- [x] Telegram - 支持 HTML/Markdown 格式
- [x] Webhook - 支持自定义 Headers、Body 模板、Content-Type

### 环境变量

| 变量                    | 必填 | 说明                                                |
| ----------------------- | ---- | --------------------------------------------------- |
| `domain`                | ✅   | 邮件域名数组，如 `["example.com"]`                  |
| `admin`                 | ✅   | 管理员邮箱                                          |
| `jwt_secret`            | ✅   | JWT 签名密钥（安全敏感）                            |
| `NOTIFIERS`             | ❌   | 启用的通知渠道，逗号分隔，默认全部启用              |
| `TIMEZONE`              | ❌   | 通知时间戳时区，默认 `Asia/Shanghai`                |
| `ai_model`              | ❌   | AI 模型，默认 `@cf/meta/llama-3.1-8b-instruct-fast` |
| `analysis_cache`        | ❌   | 分析数据缓存开关，默认 `false`                      |
| `orm_log`               | ❌   | SQL 日志开关，默认 `false`                          |
| `project_link`          | ❌   | 显示项目链接，默认 `true`                           |
| `linuxdo_switch`        | ❌   | LinuxDo OAuth 开关，默认 `false`                    |
| `linuxdo_client_id`     | ❌   | LinuxDo OAuth ID                                    |
| `linuxdo_client_secret` | ❌   | LinuxDo OAuth Secret                                |

## 技术栈

- **平台**：[Cloudflare Workers](https://developers.cloudflare.com/workers/)

- **Web框架**：[Hono](https://hono.dev/)

- **ORM：**[Drizzle](https://orm.drizzle.team/)

- **前端框架**：[Vue3](https://vuejs.org/)

- **UI框架**：[Element Plus](https://element-plus.org/)

- **邮件推送：** [Resend](https://resend.com/)

- **缓存**：[Cloudflare KV](https://developers.cloudflare.com/kv/)

- **数据库**：[Cloudflare D1](https://developers.cloudflare.com/d1/)

- **文件存储**：[Cloudflare R2](https://developers.cloudflare.com/r2/)

## 目录结构

```
cloud-mail
├── mail-worker				    # worker后端项目
│   ├── src
│   │   ├── api	 			    # api接口层
│   │   ├── const  			    # 项目常量
│   │   ├── dao                 # 数据访问层
│   │   ├── email			    # 邮件处理接收
│   │   ├── entity			    # 数据库实体
│   │   ├── error			    # 自定义异常
│   │   ├── hono			    # web框架配置、拦截器、全局异常等
│   │   ├── i18n			    # 语言国际化
│   │   ├── init			    # 数据库缓存初始化
│   │   ├── model			    # 响应体数据封装
│   │   ├── plugins			    # 插件目录（通知、迁移）
│   │   ├── security			# 身份权限认证
│   │   ├── service			    # 业务服务层
│   │   ├── template			# 消息模板
│   │   ├── utils			    # 工具类
│   │   └── index.js			# 入口文件
│   ├── package.json			# 项目依赖
│   └── wrangler.toml			# 项目配置
│
├── mail-vue				    # vue前端项目
│   ├── src
│   │   ├── axios 			    # axios配置
│   │   ├── components			# 自定义组件
│   │   ├── echarts			    # echarts组件导入
│   │   ├── i18n			    # 语言国际化
│   │   ├── init			    # 入站初始化
│   │   ├── layout			    # 主体布局组件
│   │   ├── perm			    # 权限认证
│   │   ├── plugins			    # 插件请求模块
│   │   ├── request			    # api接口
│   │   ├── router			    # 路由配置
│   │   ├── store			    # 全局状态管理
│   │   ├── utils			    # 工具类
│   │   ├── views			    # 页面组件
│   │   ├── app.vue			    # 入口组件
│   │   ├── main.js			    # 入口js
│   │   └── style.css			# 全局css
│   ├── package.json			# 项目依赖
└── └── env.release				# 项目配置
```

## 开发

```bash
# 克隆项目
git clone https://github.com/yinleren6/cloud-mail.git
cd cloud-mail

# 安装依赖
cd mail-worker && pnpm install
cd ../mail-vue && pnpm install

# 运行测试
cd mail-worker && pnpm run test:unit

# 本地开发
cd mail-worker && pnpm run dev
```

## 同步上游

```bash
# 拉取上游更新
git fetch upstream
git checkout main
git merge upstream/main

# 把更新合并到 patched 分支
git checkout patched
git merge main
```

## 赞助

<a href="https://cn3.top/blog/sponsor/" >
<img width="170px" src="./doc/images/support.png" alt="">
</a>

## 许可证

本项目采用 [GPLv3](LICENSE) 许可证

## Upstream

本项目基于 [maillab/cloud-mail](https://github.com/maillab/cloud-mail) 修改

## 交流

[Telegram](https://t.me/cloud_mail_tg)
