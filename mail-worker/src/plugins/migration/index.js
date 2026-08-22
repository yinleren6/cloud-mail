/**
 * 迁移系统入口
 * 自动注册路由 + 权限声明
 */
import './migration-api.js'

/**
 * 权限声明（供 security.js 扫描）
 */
export const pluginPermissions = [
	'/migration/start',
]

