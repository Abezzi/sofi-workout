import { relations } from 'drizzle-orm';

import { exercise } from './exercise';
import { exercise_type } from './exercise_type';
import { category } from './category';

export * from './category';
export * from './exercise_type';
export * from './exercise';

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
