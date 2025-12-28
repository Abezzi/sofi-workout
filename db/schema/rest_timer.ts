import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { routine_exercise } from './routine_exercise';
import { routine } from './routine';
import { exercise_set } from './exercise_set';
import { restTimerTypes } from '@/types/rest-timer';

export const rest_timer = sqliteTable('rest_timer', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  position: integer('position'),
  routineId: integer('routine_id')
    .notNull()
    .references(() => routine.id, { onDelete: 'cascade' }),
  routineExerciseId: integer('routine_exercise_id').references(() => routine_exercise.id, {
    onDelete: 'cascade',
  }),
  exerciseSetId: integer('exercise_set_id').references(() => exercise_set.id, {
    onDelete: 'cascade',
  }),
  restTime: integer('rest_time').notNull(),
  type: text('type', { enum: restTimerTypes }).notNull(),
});

export type RestTimer = typeof rest_timer.$inferSelect;
export default { rest_timer };
