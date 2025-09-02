import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const exercise_type = sqliteTable('exercise_type', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
});

export type ExerciseType = typeof exercise_type.$inferSelect;

export default { exercise_type };
