import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { category } from './category';
import { exercise_type } from './exercise_type';

export const exercise = sqliteTable('exercise', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  categoryId: integer('category_id')
    .notNull()
    .references(() => category.id, { onDelete: 'cascade' }),
  exerciseTypeId: integer('exercise_type_id')
    .notNull()
    .references(() => exercise_type.id, { onDelete: 'cascade' }),
});

export type Exercise = typeof exercise.$inferSelect;

export default { exercise };
