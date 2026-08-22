import { providerList } from './providers/index.js';
import { loadNotifiers } from './notifier-config.js';
import NotificationProvider from './notification-provider.js';
import orm from '../../entity/orm.js';
import { notifyRule } from './entity.js';
import { eq } from 'drizzle-orm';

// 懒初始化：首次调用 list() 时建表
let _tableReady = false;
async function ensureTable(env) {
	if (_tableReady) return;
	try {
		await env.db.prepare(`
			CREATE TABLE IF NOT EXISTS notify_rule (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				type TEXT NOT NULL,
				name TEXT DEFAULT '',
				config TEXT NOT NULL,
				enabled INTEGER DEFAULT 1 NOT NULL,
				create_time DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
			)
		`).run();
		_tableReady = true;
	} catch (e) {
		console.warn('[Notification] ensureTable failed:', e.message);
	}
}

const Notification = {
	listTypes() {
		return Object.values(providerList).map(p => p.constructor.schema());
	},
	buildMessage(emailData, env) {
		return NotificationProvider.buildMessage(emailData, env);
	},
	async sendAll(env, emailData) {
		const rules = await loadNotifiers(env);

		const tasks = rules.map(async (rule) => {
			const provider = providerList[rule.type];
			if (!provider) {
				console.error(`[Notification] Unknown provider type: ${rule.type}`);
				return { name: rule.type, success: false, error: `Unknown provider: ${rule.type}` };
			}
			try {
				const config = JSON.parse(rule.config);
				const message = NotificationProvider.buildMessage(emailData, env);
				await provider.send(config, message, env);
				console.log(`✅ [Notification] ${rule.type} sent successfully`);
				return { name: rule.type, success: true };
			} catch (e) {
				console.error(`❌ [Notification] ${rule.type} send failed:`, e.message);
				return { name: rule.type, success: false, error: e.message };
			}
		});

		const results = await Promise.all(tasks);

		const succeeded = results.filter(r => r.success).length;
		const failed = results.filter(r => !r.success).length;
		console.log(`📬 [Notification] Summary: ${succeeded} succeeded, ${failed} failed`);

		return results;
	},

	async list(env) {
		await ensureTable(env);
		return await orm({ env }).select().from(notifyRule).all();
	},

	async getById(env, id) {
		await ensureTable(env);
		return await orm({ env }).select().from(notifyRule)
			.where(eq(notifyRule.id, id)).get();
	},

	async add(env, params) {
		await ensureTable(env);
		const { type, name, config, enabled } = params;
		if (!providerList[type]) {
			throw new Error(`Unsupported notification type: ${type}`);
		}
		const result = await orm({ env }).insert(notifyRule).values({
			type,
			name: name || '',
			config: typeof config === 'string' ? config : JSON.stringify(config),
			enabled: enabled !== undefined ? (enabled ? 1 : 0) : 1,
		}).returning().get();
		return result;
	},

	async update(env, params) {
		await ensureTable(env);
		const { id, type, name, config, enabled } = params;
		const updateData = {};
		if (type !== undefined) updateData.type = type;
		if (name !== undefined) updateData.name = name;
		if (config !== undefined) {
			updateData.config = typeof config === 'string' ? config : JSON.stringify(config);
		}
		if (enabled !== undefined) updateData.enabled = enabled ? 1 : 0;
		await orm({ env }).update(notifyRule).set(updateData)
			.where(eq(notifyRule.id, id)).run();
		return await this.getById(env, id);
	},

	async delete(env, id) {
		await ensureTable(env);
		await orm({ env }).delete(notifyRule)
			.where(eq(notifyRule.id, id)).run();
	},
};

export { Notification, providerList };
