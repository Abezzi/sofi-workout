import { relations } from 'drizzle-orm';

import { exercise } from './exercise';
import { exercise_type } from './exercise_type';
import { category } from './category';
import { routine } from './routine';
import { routine_exercise } from './routine_exercise';
import { exercise_set } from './exercise_set';

export * from './category';
export * from './exercise_type';
export * from './exercise';
export * from './routine';
export * from './routine_exercise';

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
