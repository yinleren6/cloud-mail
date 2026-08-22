import NotificationProvider from '../notification-provider.js';

class WeComProvider extends NotificationProvider {
	name = 'wecom';

	static schema() {
		return {
			type: 'wecom',
			label: 'notifyWeCom',
			fields: [
				{ key: 'webhookUrl', type: 'input', label: 'wecomWebhookUrl', default: '' },
				{ key: 'contentTemplate', type: 'input', label: 'contentTemplate', default: '{{message}}', desc: 'contentTemplateDesc' },
				{ key: 'maxContentLength', type: 'input', label: 'maxContentLength', default: '' },
			],
		};
	}

	async send(config, message, env) {
		const { webhookUrl, contentTemplate } = config;
		if (!webhookUrl) return;

		const content = contentTemplate
			? this.renderTemplate(contentTemplate, message)
			: this.constructor.formatMessage(message, { maxContentLength: config.maxContentLength });

		const res = await fetch(webhookUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				msgtype: 'text',
				text: { content },
			}),
		});

		const json = await res.json().catch(() => null);
		if (json && json.errcode !== 0) {
			console.error(`[WeCom] send failed: errcode=${json.errcode} errmsg=${json.errmsg || ''}`);
		} else if (!res.ok) {
			console.error(`[WeCom] send failed: HTTP ${res.status}`);
		}
	}
}

export default WeComProvider;
