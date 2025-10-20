import { integer, sqliteTable } from 'drizzle-orm/sqlite-core';
import { routine } from './routine';
import { exercise } from './exercise';

export const routine_exercise = sqliteTable('routine_exercise', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  routineId: integer('routine_id')
    .notNull()
    .references(() => routine.id, { onDelete: 'cascade' }),
  exerciseId: integer('exercise_id')
    .notNull()
    .references(() => exercise.id, { onDelete: 'cascade' }),
  position: integer('position').notNull(),
});

export type RoutineExercise = typeof routine_exercise.$inferSelect;

export default { routine_exercise };
