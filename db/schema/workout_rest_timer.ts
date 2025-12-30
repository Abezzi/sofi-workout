import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { workout_exercise } from './workout_exercise';
import { workout } from './workout';
import { workout_set } from './workout_set';
import { restTimerTypes } from '@/types/rest-timer';

export const workout_rest_timer = sqliteTable('workout_rest_timer', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  position: integer('position'),
  workoutId: integer('workout_id')
    .notNull()
    .references(() => workout.id, { onDelete: 'cascade' }),
  workoutExerciseId: integer('workout_exercise_id').references(() => workout_exercise.id, {
    onDelete: 'cascade',
  }),
  workoutSetId: integer('workout_set_id').references(() => workout_set.id, {
    onDelete: 'cascade',
  }),
  restTime: integer('rest_time').notNull(),
  type: text('type', { enum: restTimerTypes }).notNull(),
  isActual: integer('is_actual', { mode: 'boolean' }).notNull().default(false),
});

export type WorkoutRestTimer = typeof workout_rest_timer.$inferSelect;
export type WorkoutRestTimerInsert = typeof workout_rest_timer.$inferInsert;
export default { workout_rest_timer };
