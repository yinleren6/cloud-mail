import app from '../../hono/hono';
import result from '../../model/result';
import migrationService from './migration-service.js';

app.post('/migration/start', async (c) => {
	const data = await migrationService.migrateOrphanedEmails(c);
	return c.json(result.ok(data));
});
