import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const routine = sqliteTable('routine', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
});

export type Routine = typeof routine.$inferSelect;

export default { routine };
