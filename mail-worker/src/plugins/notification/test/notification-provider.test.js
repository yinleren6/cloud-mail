import { describe, it, expect } from 'vitest';
import NotificationProvider from '../notification-provider.js';

describe('NotificationProvider.buildMessage', () => {
	const env = { TIMEZONE: 'Asia/Shanghai' };

	it('should build message from full email data', () => {
		const emailData = {
			subject: 'Test Subject',
			name: 'Sender Name',
			sendEmail: 'sender@example.com',
			toEmail: 'user@example.com',
			recipient: JSON.stringify([{ address: 'user@example.com', name: 'User' }]),
			text: 'Hello World',
			createTime: '2024-01-15T10:30:00Z',
		};

		const result = NotificationProvider.buildMessage(emailData, env);

		expect(result.subject).toBe('Test Subject');
		expect(result.from).toBe('Sender Name <sender@example.com>');
		expect(result.to).toBe('User <user@example.com>');
		expect(result.toAddress).toBe('user@example.com');
		expect(result.content).toBe('Hello World');
		expect(result.message).toContain('Test Subject');
		expect(result.message).toContain('Sender Name');
	});

	it('should handle missing fields gracefully', () => {
		const emailData = {
			subject: '',
			sendEmail: '',
			toEmail: '',
			recipient: '[]',
			text: '',
		};

		const result = NotificationProvider.buildMessage(emailData, env);

		expect(result.subject).toBe('');
		expect(result.from).toBe('');
		expect(result.to).toBe('');
		expect(result.toAddress).toBe('');
		expect(result.content).toBe('');
	});

	it('should parse recipient name correctly', () => {
		const emailData = {
			subject: 'Test',
			sendEmail: 'sender@example.com',
			toEmail: 'user@example.com',
			recipient: JSON.stringify([
				{ address: 'alice@example.com', name: 'Alice' },
				{ address: 'bob@example.com', name: 'Bob' },
			]),
			text: 'Content',
		};

		const result = NotificationProvider.buildMessage(emailData, env);

		expect(result.to).toBe('Alice <alice@example.com>');
		expect(result.toAddress).toBe('alice@example.com');
	});

	it('should use toEmail when recipient is empty', () => {
		const emailData = {
			subject: 'Test',
			sendEmail: 'sender@example.com',
			toEmail: 'fallback@example.com',
			recipient: '[]',
			text: 'Content',
		};

		const result = NotificationProvider.buildMessage(emailData, env);

		expect(result.to).toBe('fallback@example.com');
		expect(result.toAddress).toBe('fallback@example.com');
	});

	it('should handle recipient without name', () => {
		const emailData = {
			subject: 'Test',
			sendEmail: 'sender@example.com',
			toEmail: 'user@example.com',
			recipient: JSON.stringify([{ address: 'user@example.com' }]),
			text: 'Content',
		};

		const result = NotificationProvider.buildMessage(emailData, env);

		expect(result.to).toBe('user@example.com');
		expect(result.toAddress).toBe('user@example.com');
	});

	it('should include formatted message field', () => {
		const emailData = {
			subject: 'My Subject',
			sendEmail: 'sender@example.com',
			toEmail: 'user@example.com',
			recipient: JSON.stringify([{ address: 'user@example.com', name: 'User' }]),
			text: 'My Content',
		};

		const result = NotificationProvider.buildMessage(emailData, env);

		expect(result.message).toContain('📧 新邮件');
		expect(result.message).toContain('My Subject');
		expect(result.message).toContain('My Content');
	});
});

describe('NotificationProvider.formatMessage', () => {
	it('should format message with all fields', () => {
		const message = {
			subject: 'Test Subject',
			from: 'sender@example.com',
			to: 'user@example.com',
			content: 'Hello World',
			timestamp: '2024/1/15 10:30:00',
		};

		const result = NotificationProvider.formatMessage(message);

		expect(result).toContain('📧 新邮件');
		expect(result).toContain('━━━━━━━━━━━━━━');
		expect(result).toContain('主题: Test Subject');
		expect(result).toContain('时间: 2024/1/15 10:30:00');
		expect(result).toContain('发件人: sender@example.com');
		expect(result).toContain('收件人: user@example.com');
		expect(result).toContain('内容:');
		expect(result).toContain('Hello World');
	});

	it('should truncate content by maxContentLength', () => {
		const message = {
			subject: 'Test',
			from: 'a@b.com',
			to: 'c@d.com',
			content: 'A'.repeat(1000),
			timestamp: '2024/1/15 10:30:00',
		};

		const result = NotificationProvider.formatMessage(message, { maxContentLength: 100 });

		expect(result).toContain('A'.repeat(100) + '...');
		expect(result).not.toContain('A'.repeat(101));
	});

	it('should handle empty content', () => {
		const message = {
			subject: 'Test',
			from: 'a@b.com',
			to: 'c@d.com',
			content: '',
			timestamp: '2024/1/15 10:30:00',
		};

		const result = NotificationProvider.formatMessage(message);

		expect(result).not.toContain('内容:');
	});

	it('should handle missing subject', () => {
		const message = {
			subject: '',
			from: 'a@b.com',
			to: 'c@d.com',
			content: 'Content',
			timestamp: '2024/1/15 10:30:00',
		};

		const result = NotificationProvider.formatMessage(message);

		expect(result).toContain('主题: (无主题)');
	});

	it('should use default maxContentLength when not provided', () => {
		const message = {
			subject: 'Test',
			from: 'a@b.com',
			to: 'c@d.com',
			content: 'A'.repeat(2500),
			timestamp: '2024/1/15 10:30:00',
		};

		const result = NotificationProvider.formatMessage(message);

		expect(result).toContain('A'.repeat(2000) + '...');
	});

	it('should convert string maxContentLength to number', () => {
		const message = {
			subject: 'Test',
			from: 'a@b.com',
			to: 'c@d.com',
			content: 'A'.repeat(100),
			timestamp: '2024/1/15 10:30:00',
		};

		const result = NotificationProvider.formatMessage(message, { maxContentLength: '50' });

		expect(result).toContain('A'.repeat(50) + '...');
	});
});
