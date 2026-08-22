import orm from '../../entity/orm.js';
import { notifyRule } from './entity.js';
import { eq } from 'drizzle-orm';

function filterByNotifiers(rules, env) {
	const raw = env.NOTIFIERS?.trim();
	if (!raw || raw === '*') return rules;
	const allowed = raw.split(',').map(s => s.trim().toLowerCase());
	return rules.filter(r => allowed.includes(r.type));
}

export async function loadNotifiers(env) {
	// 懒初始化：确保表存在
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
	} catch (e) {
		console.warn('[Notification] ensureTable failed:', e.message);
	}

	const dbRules = await orm({ env }).select().from(notifyRule)
		.where(eq(notifyRule.enabled, 1)).all();
	return filterByNotifiers(dbRules, env);
}
