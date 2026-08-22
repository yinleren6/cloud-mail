import app from '../../hono/hono';
import { Notification, providerList } from './notification.js';
import result from '../../model/result';
import BizError from '../../error/biz-error';
import { t } from '../../i18n/i18n';
import orm from '../../entity/orm.js';
import { email } from '../../entity/email.js';
import { eq } from 'drizzle-orm';

app.get('/notify/list', async (c) => {
	const list = await Notification.list(c.env);
	return c.json(result.ok(list));
});

app.get('/notify/types', (c) => {
	const types = Notification.listTypes();
	return c.json(result.ok(types));
});

app.post('/notify/add', async (c) => {
	const params = await c.req.json();
	const rule = await Notification.add(c.env, params);
	return c.json(result.ok(rule));
});

app.put('/notify/set', async (c) => {
	const params = await c.req.json();
	if (!params.id) {
		throw new BizError(t('emptyId'), 400);
	}
	const rule = await Notification.update(c.env, params);
	return c.json(result.ok(rule));
});

app.delete('/notify/delete', async (c) => {
	let id;
	try {
		({ id } = await c.req.json());
	} catch {
		throw new BizError(t('emptyId'), 400);
	}
	if (!id) {
		throw new BizError(t('emptyId'), 400);
	}
	await Notification.delete(c.env, id);
	return c.json(result.ok());
});

app.post('/notify/test/:id', async (c) => {
	const id = Number(c.req.param('id'));
	const rule = await Notification.getById(c.env, id);
	if (!rule) {
		throw new BizError('Notify rule not found', 404);
	}
	const provider = providerList[rule.type];
	if (!provider) {
		throw new BizError('Provider not found', 404);
	}
	const config = (() => { try { return JSON.parse(rule.config); } catch { return {}; } })();
	const testEmail = {
		subject: 'Test notification',
		sendEmail: 'test@example.com',
		toEmail: 'user@example.com',
		name: 'Test Sender',
		text: 'This is a test message from Cloud Mail notification system.',
		content: '',
		recipient: JSON.stringify([{ address: 'user@example.com', name: 'Test User' }]),
	};
	const message = Notification.buildMessage(testEmail, c.env);
	const results = [];
	try {
		await provider.send(config, message, c.env);
		results.push({ name: rule.type, success: true });
	} catch (e) {
		results.push({ name: rule.type, success: false, error: e.message });
	}
	return c.json(result.ok(results));
});

app.post('/notify/test-preview', async (c) => {
	const { type, config } = await c.req.json();
	const provider = providerList[type];
	if (!provider) {
		throw new BizError('Provider not found', 404);
	}
	const testEmail = {
		subject: 'Test notification',
		sendEmail: 'test@example.com',
		toEmail: 'user@example.com',
		name: 'Test Sender',
		text: 'This is a test message from Cloud Mail notification system.',
		content: '',
		recipient: JSON.stringify([{ address: 'user@example.com', name: 'Test User' }]),
	};
	const message = Notification.buildMessage(testEmail, c.env);
	const results = [];
	try {
		await provider.send(config, message, c.env);
		results.push({ name: type, success: true });
	} catch (e) {
		results.push({ name: type, success: false, error: e.message });
	}
	return c.json(result.ok(results));
});

app.post('/notify/re-notify/:emailId', async (c) => {
	const emailId = Number(c.req.param('emailId'));
	const emailRow = await orm({ env: c.env }).select().from(email)
		.where(eq(email.emailId, emailId)).get();
	if (!emailRow) {
		throw new BizError('Email not found', 404);
	}
	const results = await Notification.sendAll(c.env, emailRow);
	return c.json(result.ok(results));
});
