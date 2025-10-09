import { relations } from 'drizzle-orm';

import { exercise } from './exercise';
import { exercise_type } from './exercise_type';
import { category } from './category';
import { routine } from './routine';
import { routine_exercise } from './routine_exercise';
import { exercise_set } from './exercise_set';
import { rest_timer } from './rest_timer';

export * from './category';
export * from './exercise_type';
export * from './exercise';
export * from './routine';
export * from './routine_exercise';
export * from './exercise_set';
export * from './rest_timer';

export const exerciseRelations = relations(exercise, ({ one }) => ({
  category: one(category, {
    fields: [exercise.categoryId],
    references: [category.id],
  }),
  exercise_type: one(exercise_type, {
    fields: [exercise.exerciseTypeId],
    references: [exercise_type.id],
  }),
}));

export const routineExerciseRelations = relations(routine_exercise, ({ one }) => ({
  routine: one(routine, {
    fields: [routine_exercise.routineId],
    references: [routine.id],
  }),
  exercise: one(exercise, {
    fields: [routine_exercise.exerciseId],
    references: [exercise.id],
  }),
}));

export const exerciseSetRelations = relations(exercise_set, ({ one }) => ({
  routine: one(routine_exercise, {
    fields: [exercise_set.routineExerciseId],
    references: [routine_exercise.id],
  }),
}));

export const restTimerRelations = relations(rest_timer, ({ one }) => ({
  routine: one(routine, {
    fields: [rest_timer.routineId],
    references: [routine.id],
  }),
  routine_exercise: one(routine_exercise, {
    fields: [rest_timer.routineExerciseId],
    references: [routine_exercise.id],
  }),
  exercise_set: one(exercise_set, {
    fields: [rest_timer.exerciseSetId],
    references: [exercise_set.id],
  }),
}));
