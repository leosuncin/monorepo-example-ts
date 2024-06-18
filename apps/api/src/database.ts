import type { Database } from '@monorepo/data-access';
import SQLite from 'better-sqlite3';
import { Kysely, SqliteDialect, sql } from 'kysely';
import { SerializePlugin } from 'kysely-plugin-serialize';

export const database = new Kysely<Database>({
  dialect: new SqliteDialect({
    database: new SQLite(process.env['DATABASE_FILENAME'] ?? ':memory:'),
  }),
  plugins: [new SerializePlugin()],
});

void database.schema
  .createTable('tasks')
  .addColumn('id', 'text', (col) => col.primaryKey())
  .addColumn('title', 'text', (col) =>
    col.notNull().check(sql`LENGTH(title) > 0`),
  )
  .addColumn('completed', 'varchar(5)', (col) =>
    col
      .notNull()
      .defaultTo('false')
      .check(sql`completed = 'true' OR completed = 'false'`),
  )
  .ifNotExists()
  .execute();
