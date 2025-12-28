import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { routine } from './routine';

export const workout = sqliteTable('workout', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  routineId: integer('routine_id')
    .notNull()
    .references(() => routine.id, { onDelete: 'cascade' }),
  completedAt: text('completedAt'),
  duration: integer('duration'),
  notes: text('notes'),
});

export type Workout = typeof workout.$inferSelect;
export default { workout };
