import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const restModeTypes = ['automatic', 'manual'] as const;
export type RestTimerType = (typeof restModeTypes)[number];

export const routine = sqliteTable('routine', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  restMode: text('rest_mode', { enum: restModeTypes }).notNull(),
});

export type Routine = typeof routine.$inferSelect;

export default { routine };
