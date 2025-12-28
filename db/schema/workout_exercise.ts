import { integer, sqliteTable } from 'drizzle-orm/sqlite-core';
import { workout } from './workout';
import { exercise } from './exercise';

export const workout_exercise = sqliteTable('workout_exercise', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  workoutId: integer('workout_id')
    .notNull()
    .references(() => workout.id, { onDelete: 'cascade' }),
  exerciseId: integer('exercise_id')
    .notNull()
    .references(() => exercise.id, { onDelete: 'cascade' }),
  position: integer('position').notNull(),
});

export type WorkoutExercise = typeof workout_exercise.$inferSelect;

export default { workout_exercise };
