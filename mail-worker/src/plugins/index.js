/**
 * 插件自动注册入口
 * 所有插件的 DB 初始化 + 路由注册都会在这里自动触发
 */

// 通知系统（含 DB 建表 + API 路由）
import './notification/index.js'

// 迁移系统（含 API 路由）
import './migration/index.js'

/**
 * 所有插件的权限配置（由 security.js 读取）
 * 插件可以在自己的 index.js 中 export pluginPermissions
 */
export const pluginPermissions = [
	'/migration/start',
]
