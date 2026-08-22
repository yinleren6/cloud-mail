/**
 * 通知系统入口
 * 自动完成：DB 建表（懒初始化）+ 路由注册 + 权限声明
 */

// 路由注册（Hono 路由在 import 时生效）
import './notify-api.js'

// 导出核心函数供外部调用
import { Notification } from './notification.js'

/**
 * 发送通知的入口函数
 */
export async function dispatchNotification(env, emailRow) {
	return Notification.sendAll(env, emailRow)
}

/**
 * 权限声明（供 security.js 扫描）
 */
export const pluginPermissions = [
	'/notify/list',
	'/notify/types',
	'/notify/add',
	'/notify/set',
	'/notify/delete',
	'/notify/test/:id',
	'/notify/test-preview',
	'/notify/re-notify/:emailId',
	'/migration/start',
]

