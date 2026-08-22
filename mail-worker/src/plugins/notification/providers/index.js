import WebhookProvider from './webhook.js';
import OneBotProvider from './onebot.js';
import TelegramProvider from './telegram.js';
import WeComProvider from './wecom.js';
import DingTalkProvider from './dingtalk.js';
import FeishuProvider from './feishu.js';

const providerList = {};

function init() {
	const providers = [
		new WebhookProvider(),
		new OneBotProvider(),
		new TelegramProvider(),
		new WeComProvider(),
		new DingTalkProvider(),
		new FeishuProvider(),
	];

	for (const p of providers) {
		if (!p.name) {
			throw new Error('Notification provider without name');
		}
		providerList[p.name] = p;
	}
}

init();

export { providerList };
