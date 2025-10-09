import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { routine_exercise } from './routine_exercise';

export const exercise_set = sqliteTable('exercise_set', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  routineExerciseId: integer('routine_exercise_id')
    .notNull()
    .references(() => routine_exercise.id),
  setNumber: integer('setNumber').notNull(),
  quantity: integer('quantity').notNull(),
  weight: integer('weight').notNull(),
});

export type ExerciseSet = typeof exercise_set.$inferSelect;

export default { exercise_set };
