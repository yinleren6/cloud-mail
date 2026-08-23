> [!IMPORTANT]
> This project is a fork of [maillab/cloud-mail](https://github.com/maillab/cloud-mail) with the following changes:
>
> - **Plugin-based Notification System**: Added support for WeCom, DingTalk, Feishu, OneBot, Telegram, and Webhook notifications with custom Headers, Body template variables, and Content-Type
> - **Email Auto-Matching**: One-click email matching to corresponding mailboxes
> - **Plugin Architecture**: Notification and migration systems use plugin-based design, with only 4 lines of changes to core files for easy upstream sync

<p align="center">
    <img src="doc/demo/logo.png" width="80px" />
    <h1 align="center">Cloud Mail</h1>
    <p align="center">A simple, responsive email service designed to run on Cloudflare Workers 🎉</p> 
    <p align="center">
       <a href="/README.md" style="margin-left: 5px">简体中文</a> | English 
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

## Description

With only one domain, you can create multiple different email addresses, similar to major email platforms. This project can be deployed on Cloudflare Workers to reduce server costs and build your own email service.

## Project Showcase

- [Live Demo](https://skymail.ink)<br>
- [Deployment Guide](https://doc.skymail.ink/en/)<br>

| ![](/doc/demo/demo1.png) | ![](/doc/demo/demo2.png) |
| ------------------------ | ------------------------ |
| ![](/doc/demo/demo3.png) | ![](/doc/demo/demo4.png) |

## Features

- **💰 Low-Cost Usage**: No server required — deploy to Cloudflare Workers to reduce costs.

- **💻 Responsive Design**: Automatically adapts to both desktop and most mobile browsers.

- **📧 Email Sending**: Integrated with Resend, supporting bulk email sending and attachments.

- **🛡️ Admin Features**: Admin controls for user and email management with RBAC-based access control.

- **📦 Attachment Support**: Send and receive attachments, stored and downloaded via R2 object storage.

- **🔔 Email Push**: Forward received emails to Telegram bots or other email providers.

- **📡 Open API**: Supports batch user creation via API and multi-condition email queries

- **🔢 Verification Code Recognition**: Auto-detect codes via Workers AI

- **📈 Data Visualization**: Use ECharts to visualize system data, including user email growth.

- **🎨 Personalization**: Customize website title, login background, and transparency.

- **🤖 CAPTCHA**: Integrated with Turnstile CAPTCHA to prevent automated registration.

- **📜 More Features**: Under development...

## New Features in This Fork

### Notification System

Plugin-based architecture supporting 6 notification channels:

- [x] WeCom (Enterprise WeChat) - [How to get Webhook URL](https://cloud.tencent.com/document/product/1759/128391)
- [x] DingTalk - [How to get Webhook URL](https://open.dingtalk.com/document/robots/custom-robot-access)
- [x] Feishu (Lark) - [How to get Webhook URL](https://open.feishu.cn/document/client-docs/bot-v3/add-custom-bot)
- [x] OneBot (QQ) - Supports reverse WebSocket
- [x] Telegram - Supports HTML/Markdown format
- [x] Webhook - Custom Headers, Body template, Content-Type

### Environment Variables

| Variable                | Required | Description                                                 |
| ----------------------- | -------- | ----------------------------------------------------------- |
| `domain`                | ✅       | Email domains array, e.g. `["example.com"]`                 |
| `admin`                 | ✅       | Admin email address                                         |
| `jwt_secret`            | ✅       | JWT signing secret (security sensitive)                     |
| `NOTIFIERS`             | ❌       | Comma-separated notification channels, default: all enabled |
| `TIMEZONE`              | ❌       | Notification timestamp timezone, default: `Asia/Shanghai`   |
| `ai_model`              | ❌       | AI model, default: `@cf/meta/llama-3.1-8b-instruct-fast`    |
| `analysis_cache`        | ❌       | Analysis data cache toggle, default: `false`                |
| `orm_log`               | ❌       | SQL log toggle, default: `false`                            |
| `project_link`          | ❌       | Show project link, default: `true`                          |
| `linuxdo_switch`        | ❌       | LinuxDo OAuth toggle, default: `false`                      |
| `linuxdo_client_id`     | ❌       | LinuxDo OAuth client ID                                     |
| `linuxdo_client_secret` | ❌       | LinuxDo OAuth client secret                                 |

## Tech Stack

- **Platform**: [Cloudflare Workers](https://developers.cloudflare.com/workers/)

- **Web Framework**: [Hono](https://hono.dev/)

- **ORM**: [Drizzle](https://orm.drizzle.team/)

- **Frontend Framework**: [Vue3](https://vuejs.org/)

- **UI Framework**: [Element Plus](https://element-plus.org/)

- **Email Service**: [Resend](https://resend.com/)

- **Cache**: [Cloudflare KV](https://developers.cloudflare.com/kv/)

- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/)

- **File Storage**: [Cloudflare R2](https://developers.cloudflare.com/r2/)

## Project Structure

```
cloud-mail
├── mail-worker				    # Backend worker project
│   ├── src
│   │   ├── api	 			    # API layer
│   │   ├── const  			    # Project constants
│   │   ├── dao                 # Data access layer
│   │   ├── email			    # Email processing and handling
│   │   ├── entity			    # Database entities
│   │   ├── error			    # Custom exceptions
│   │   ├── hono			    # Web framework, middleware, error handling
│   │   ├── i18n			    # Internationalization
│   │   ├── init			    # Database and cache initialization
│   │   ├── model			    # Response data models
│   │   ├── plugins			    # Plugin directory (notification, migration)
│   │   ├── security			# Authentication and authorization
│   │   ├── service			    # Business logic layer
│   │   ├── template			# Message templates
│   │   ├── utils			    # Utility functions
│   │   └── index.js			# Entry point
│   ├── package.json			# Project dependencies
│   └── wrangler.toml			# Project configuration
│
├── mail-vue				    # Frontend Vue project
│   ├── src
│   │   ├── axios 			    # Axios configuration
│   │   ├── components			# Custom components
│   │   ├── echarts			    # ECharts integration
│   │   ├── i18n			    # Internationalization
│   │   ├── init			    # Startup initialization
│   │   ├── layout			    # Main layout components
│   │   ├── perm			    # Permissions and access control
│   │   ├── plugins			    # Plugin request modules
│   │   ├── request			    # API request layer
│   │   ├── router			    # Router configuration
│   │   ├── store			    # Global state management
│   │   ├── utils			    # Utility functions
│   │   ├── views			    # Page components
│   │   ├── app.vue			    # Root component
│   │   ├── main.js			    # Entry JS file
│   │   └── style.css			# Global styles
│   ├── package.json			# Project dependencies
└── └── env.release				# Environment configuration
```

## Development

```bash
# Clone the project
git clone https://github.com/yinleren6/cloud-mail.git
cd cloud-mail

# Install dependencies
cd mail-worker && pnpm install
cd ../mail-vue && pnpm install

# Run tests
cd mail-worker && pnpm run test:unit

# Local development
cd mail-worker && pnpm run dev
```

## Syncing Upstream

```bash
# Fetch upstream changes
git fetch upstream
git checkout main
git merge upstream/main

# Merge updates into patched branch
git checkout patched
git merge main
```

## Sponsor

<a href="https://cn3.top/blog/sponsor/" >
<img width="170px" src="./doc/images/support.png" alt="">
</a>

## License

This project is licensed under the [GPLv3](LICENSE) license.

## Upstream

This project is a fork of [maillab/cloud-mail](https://github.com/maillab/cloud-mail).

## Communication

[Telegram](https://t.me/cloud_mail_tg)
