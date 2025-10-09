import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { routine_exercise } from './routine_exercise';
import { routine } from './routine';
import { exercise_set } from './exercise_set';

const restTimerTypes = ['set', 'exercise'] as const;
// FIXME: not sure if I should export this type or not
type RestTimerType = (typeof restTimerTypes)[number];

export const rest_timer = sqliteTable('rest_timer', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  routineId: integer('routine_id')
    .notNull()
    .references(() => routine_exercise.id),
  routineExerciseId: integer('routine_exercise_id').references(() => routine.id),
  exerciseSetId: integer('exercise_set_id').references(() => exercise_set.id),
  restTime: integer('rest_time').notNull(),
  type: text('type', { enum: restTimerTypes }).notNull(),
});

export type RestTimer = typeof rest_timer.$inferSelect;
export default { rest_timer };
