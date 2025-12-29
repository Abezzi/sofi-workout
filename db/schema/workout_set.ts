import { integer, sqliteTable } from 'drizzle-orm/sqlite-core';
import { workout_exercise } from './workout_exercise';

export const workout_set = sqliteTable('workout_set', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  workoutExerciseId: integer('workout_exercise_id')
    .notNull()
    .references(() => workout_exercise.id, { onDelete: 'cascade' }),
  setNumber: integer('set_number'),
  quantity: integer('quantity'),
  weight: integer('weight'),
});

export type WorkoutSet = typeof workout_set.$inferSelect;

export default { workout_set };
