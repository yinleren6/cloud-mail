import NotificationProvider from '../notification-provider.js';

function escapeHtml(text = '') {
	return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeMarkdownV2(text) {
	if (!text) return text;
	return String(text).replace(/[_*[\]()~>#+\-=|{}.!\\]/g, '\\$&');
}

class TelegramProvider extends NotificationProvider {
	name = 'telegram';

	static schema() {
		return {
			type: 'telegram',
			label: 'notifyTelegram',
			fields: [
				{ key: 'botToken', type: 'input', label: 'tgBotToken', default: '' },
				{ key: 'chatIds', type: 'input', label: 'tgChatIds', default: '' },
				{ key: 'serverUrl', type: 'input', label: 'tgServerUrl', default: '' },
				{
					key: 'msgFrom',
					type: 'select',
					label: 'senderInfo',
					default: 'show',
					options: [
						{ value: 'show', label: 'show' },
						{ value: 'hide', label: 'hide' },
						{ value: 'only-name', label: 'onlyName' },
					],
				},
				{
					key: 'msgTo',
					type: 'select',
					label: 'recipient',
					default: 'show',
					options: [
						{ value: 'show', label: 'show' },
						{ value: 'hide', label: 'hide' },
					],
				},
				{
					key: 'msgText',
					type: 'select',
					label: 'emailText',
					default: 'show',
					options: [
						{ value: 'show', label: 'show' },
						{ value: 'hide', label: 'hide' },
					],
				},
				{
					key: 'parseMode',
					type: 'select',
					label: 'parseMode',
					default: 'HTML',
					options: [
						{ value: 'HTML', label: 'HTML' },
						{ value: 'MarkdownV2', label: 'MarkdownV2' },
						{ value: 'plain', label: 'plainText' },
					],
				},
				{ key: 'messageThreadId', type: 'input', label: 'tgThreadId', default: '' },
				{ key: 'sendSilently', type: 'switch', label: 'tgSendSilently', default: false },
				{ key: 'disableLinkPreview', type: 'switch', label: 'tgDisableLinkPreview', default: true },
				{ key: 'maxContentLength', type: 'input', label: 'maxContentLength', default: '' },
			],
		};
	}

	async send(config, message, env) {
		const {
			botToken,
			chatIds,
			msgFrom,
			msgTo,
			msgText,
			parseMode = 'HTML',
			serverUrl,
			messageThreadId,
			sendSilently = false,
			disableLinkPreview = true,
		} = config;
		if (!botToken || !chatIds) return;

		const chatIdList = chatIds
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
		const baseUrl = serverUrl || 'https://api.telegram.org';
		const text = this.buildText(message, parseMode, config);

		await Promise.all(
			chatIdList.map(async (chatId) => {
				try {
					const params = {
						chat_id: chatId,
						text,
						disable_notification: sendSilently,
						link_preview_options: { is_disabled: disableLinkPreview },
					};

					if (parseMode !== 'plain') {
						params.parse_mode = parseMode;
					}

					if (messageThreadId) {
						params.message_thread_id = parseInt(messageThreadId, 10);
					}

					const res = await fetch(`${baseUrl}/bot${botToken}/sendMessage`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(params),
					});

					if (!res.ok) {
						const errText = await res.text();
						console.error(`[Telegram] send failed: ${res.status} chatId: ${chatId} ${errText}`);
					}
				} catch (e) {
					console.error(`[Telegram] send error chatId: ${chatId}`, e.message);
				}
			}),
		);
	}

	buildText(message, parseMode, config) {
		const { msgFrom = 'only-name', msgTo = 'show', msgText = 'show' } = config;
		const raw = this.constructor.formatMessage(message, { maxContentLength: config.maxContentLength });

		if (parseMode === 'plain') {
			return this.filterText(raw, msgFrom, msgTo, msgText, message);
		}

		if (parseMode === 'MarkdownV2') {
			return this.textToMarkdownV2(this.filterText(raw, msgFrom, msgTo, msgText, message));
		}

		// HTML mode
		return this.textToHtml(this.filterText(raw, msgFrom, msgTo, msgText, message));
	}

	filterText(raw, msgFrom, msgTo, msgText, message) {
		const lines = raw.split('\n');
		const filtered = [];
		for (const line of lines) {
			if (line.startsWith('发件人:')) {
				if (msgFrom === 'hide') continue;
				if (msgFrom === 'only-name') {
					const match = message.from.match(/^([^<]+)/);
					const name = match ? match[1].trim() : message.from;
					filtered.push(`发件人: ${name}`);
					continue;
				}
			}
			if (line.startsWith('收件人:') && msgTo === 'hide') continue;
			if (line.startsWith('内容:') && msgText === 'hide') continue;
			filtered.push(line);
		}
		return filtered.join('\n');
	}

	textToHtml(text) {
		const lines = text.split('\n');
		return lines
			.map((line) => {
				if (line === '📧 新邮件') return '<b>📧 新邮件</b>';
				if (line === '━━━━━━━━━━━━━━') return '━━━━━━━━━━━━━━';
				if (line.startsWith('主题:')) return `<b>主题:</b> ${escapeHtml(line.slice(3))}`;
				if (line.startsWith('时间:')) return `<b>时间:</b> ${escapeHtml(line.slice(3))}`;
				if (line.startsWith('发件人:')) return `<b>发件人:</b> ${escapeHtml(line.slice(4))}`;
				if (line.startsWith('收件人:')) return `<b>收件人:</b> ${escapeHtml(line.slice(4))}`;
				if (line.startsWith('内容:')) return `<b>内容:</b> ${escapeHtml(line.slice(3))}`;
				return escapeHtml(line);
			})
			.join('\n');
	}

	textToMarkdownV2(text) {
		const lines = text.split('\n');
		return lines
			.map((line) => {
				if (line === '📧 新邮件') return '*📧 新邮件*';
				if (line === '━━━━━━━━━━━━━━') return '━━━━━━━━━━━━━━';
				if (line.startsWith('主题:')) return `*主题:* ${escapeMarkdownV2(line.slice(3))}`;
				if (line.startsWith('时间:')) return `*时间:* ${escapeMarkdownV2(line.slice(3))}`;
				if (line.startsWith('发件人:')) return `*发件人:* ${escapeMarkdownV2(line.slice(4))}`;
				if (line.startsWith('收件人:')) return `*收件人:* ${escapeMarkdownV2(line.slice(4))}`;
				if (line.startsWith('内容:')) return `*内容:*${line.slice(3) ? ' ' + escapeMarkdownV2(line.slice(3)) : ''}`;
				return escapeMarkdownV2(line);
			})
			.join('\n');
	}
}

export default TelegramProvider;
