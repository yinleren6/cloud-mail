import NotificationProvider from '../notification-provider.js';

class WebhookProvider extends NotificationProvider {
	name = 'webhook';

	static schema() {
		return {
			type: 'webhook',
			label: 'notifyWebhook',
			fields: [
				{ key: 'url', type: 'input', label: 'webhookUrl', default: '' },
				{
					key: 'method',
					type: 'select',
					label: 'webhookMethod',
					default: 'POST',
					options: [
						{ value: 'POST', label: 'POST' },
						{ value: 'GET', label: 'GET' },
					],
				},
				{
					key: 'contentType',
					type: 'select',
					label: 'webhookContentType',
					default: 'json',
					options: [
						{ value: 'json', label: 'json' },
						{ value: 'form-data', label: 'formData' },
						{ value: 'custom', label: 'customBody' },
					],
				},
				{ key: 'headers', type: 'input', label: 'webhookHeaders', default: '' },
				{ key: 'bodyTemplate', type: 'input', label: 'webhookBodyTemplate', default: '' },
				{ key: 'maxContentLength', type: 'input', label: 'maxContentLength', default: '' },
			],
		};
	}

	async send(config, message, env) {
		const { url, method, headers, contentType } = config;
		if (!url) return;

		const httpMethod = (method || 'POST').toLowerCase();

		const requestHeaders = {};
		if (headers) {
			Object.assign(requestHeaders, this.parseHeaders(headers));
		}

		if (httpMethod === 'get') {
			const { subject, from, to, toAddress, timestamp } = message;
			const simple = { subject, from, to, toAddress, timestamp };
			const searchParams = new URLSearchParams(simple).toString();
			const separator = url.includes('?') ? '&' : '?';
			try {
				const res = await fetch(`${url}${separator}${searchParams}`, {
					method: 'GET',
					headers: requestHeaders,
				});
				if (!res.ok) {
					console.error(`[Webhook] GET failed: ${res.status}`);
				}
			} catch (e) {
				console.error(`[Webhook] GET error:`, e.message);
			}
			return;
		}

		let body;
		const rawBody = config.bodyTemplate || {};
		const bodyObj =
			typeof rawBody === 'string'
				? (() => {
						try {
							return JSON.parse(rawBody);
						} catch {
							return {};
						}
					})()
				: rawBody;

		if (contentType === 'form-data') {
			const form = new FormData();
			form.append('data', JSON.stringify(bodyObj));
			Object.assign(requestHeaders, Object.fromEntries(form.headers));
			body = form;
		} else {
			const rendered = this.renderObject(bodyObj, message);
			body = JSON.stringify(rendered);
			if (!requestHeaders['Content-Type'] && !requestHeaders['content-type']) {
				requestHeaders['Content-Type'] = 'application/json';
			}
		}

		try {
			const res = await fetch(url, {
				method: 'POST',
				headers: requestHeaders,
				body,
			});
			if (!res.ok) {
				console.error(`[Webhook] POST failed: ${res.status}`);
			}
		} catch (e) {
			console.error(`[Webhook] POST error:`, e.message);
		}
	}

	renderObject(obj, data) {
		if (typeof obj === 'string') return this.renderTemplate(obj, data);
		if (Array.isArray(obj)) return obj.map((item) => this.renderObject(item, data));
		if (obj && typeof obj === 'object') {
			const result = {};
			for (const [key, value] of Object.entries(obj)) {
				result[key] = this.renderObject(value, data);
			}
			return result;
		}
		return obj;
	}

	parseHeaders(headers) {
		if (!headers) return {};
		try {
			return typeof headers === 'string' ? JSON.parse(headers) : headers;
		} catch {
			return {};
		}
	}
}

export default WebhookProvider;
