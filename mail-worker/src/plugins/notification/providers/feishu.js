import NotificationProvider from '../notification-provider.js';

class FeishuProvider extends NotificationProvider {
	name = 'feishu';

	static schema() {
		return {
			type: 'feishu',
			label: 'notifyFeishu',
			fields: [
				{ key: 'webhookUrl', type: 'input', label: 'feishuWebhookUrl', default: '' },
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
				msg_type: 'text',
				content: { text: content },
			}),
		});

		const json = await res.json().catch(() => null);
		if (json && json.code !== 0) {
			console.error(`[Feishu] send failed: code=${json.code} msg=${json.msg || ''}`);
		} else if (!res.ok) {
			console.error(`[Feishu] send failed: HTTP ${res.status}`);
		}
	}
}

export default FeishuProvider;
