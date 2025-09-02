import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const category = sqliteTable('category', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  color: text('color').notNull(),
});

export type Category = typeof category.$inferSelect;

export default { category };
