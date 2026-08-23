import emailUtils from '../../utils/email-utils.js';

class NotificationProvider {
	name = '';

	static buildMessage(emailData, env) {
		const tz = env.TIMEZONE || 'Asia/Shanghai';
		const ts = emailData.createTime ? new Date(emailData.createTime) : new Date();
		const timestamp = ts.toLocaleString('zh-CN', { timeZone: tz, hour12: false });

		const subject = emailData.subject || '';
		const fromName = emailData.name || '';
		const fromEmail = emailData.sendEmail || '';
		const from = fromName ? `${fromName} <${fromEmail}>` : fromEmail;

		let to = emailData.toEmail || '';
		let toAddress = emailData.toEmail || '';
		try {
			const list = JSON.parse(emailData.recipient || '[]');
			if (list.length > 0) {
				const r = list[0];
				to = r.name ? `${r.name} <${r.address}>` : r.address || '';
				toAddress = r.address || '';
			}
		} catch {}

		const content = emailData.text || emailUtils.htmlToText(emailData.content) || '';

		const msg = this.formatMessage({ subject, from, to, toAddress, content, timestamp });

		return { subject, from, to, toAddress, content, timestamp, message: msg };
	}

	static formatMessage(message, options = {}) {
		const maxContentLength = Number(options.maxContentLength) || 2000;
		const content = message.content.length > maxContentLength ? message.content.slice(0, maxContentLength) + '...' : message.content;
		const lines = [
			`📧 新邮件`,
			`━━━━━━━━━━━━━━`,
			`主题: ${message.subject || '(无主题)'}`,
			`时间: ${message.timestamp}`,
			`发件人: ${message.from}`,
			`收件人: ${message.to}`,
		];
		if (content) {
			lines.push(`内容:\n${content}`);
		}
		return lines.join('\n');
	}

	renderTemplate(template, data) {
		return template
			.replace(/\{\{subject\}\}/g, data.subject)
			.replace(/\{\{from\}\}/g, data.from)
			.replace(/\{\{to\}\}/g, data.to)
			.replace(/\{\{toAddress\}\}/g, data.toAddress)
			.replace(/\{\{content\}\}/g, data.content)
			.replace(/\{\{message\}\}/g, data.message)
			.replace(/\{\{timestamp\}\}/g, data.timestamp);
	}

	async send(config, message, env) {
		throw new Error('send() must be overridden');
	}
}

export default NotificationProvider;
