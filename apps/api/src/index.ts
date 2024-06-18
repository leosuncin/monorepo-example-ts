import { createServer } from 'node:http';
import { createTerminus } from '@godaddy/terminus';

import { app } from './app.js';
import { database } from './database.js';
import { sql } from 'kysely';

const port = Number.parseInt(process.env['PORT'] ?? '3030') || 3030;

const server = createServer(app);

createTerminus(server, {
  healthChecks: {
    '/health-check'() {
      return sql`SELECT 1+1`.execute(database).then(() => ({ db: 'up' }));
    },
  },
});

server.listen(port, () => {
  console.info(`Server listening at http://localhost:${port}`);
});
