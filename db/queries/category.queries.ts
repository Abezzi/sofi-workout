import { eq } from 'drizzle-orm';
import { Category, category } from '../schema';
import { db } from '..';

/**
 * @param dbRecord - record from the db
 * @returns Category
 */
export function transformDbToCategory(dbRecord: any): Category {
  return {
    id: dbRecord.id,
    name: dbRecord.name,
    color: dbRecord.color,
  };
}

/**
 * @param  category
 * @returns
 */
export function transformCategoryToDb(category: Partial<Category>): any {
  const dbRecord: any = {};

  if (category.id !== undefined) dbRecord.id = category.id;
  if (category.name !== undefined) dbRecord.name = category.name;
  if (category.color !== undefined) dbRecord.color = category.color;

  return dbRecord;
}

/**
 * @param  categoryToPost- category object you want to instert into the category db
 * @returns Category
 */
export async function postCategory(categoryToPost: Category): Promise<boolean> {
  try {
    await db.insert(category).values({
      name: categoryToPost.name,
      color: categoryToPost.color,
    });
    return true;
  } catch (error) {
    console.log(error);
    throw false;
  }
}

/**
 * @returns Category[] || error
 */
export async function getAllCategories(): Promise<Category[]> {
  try {
    const result = await db.select().from(category);

    if (result.length === 0) {
      return [];
    }

    return result.map(transformDbToCategory);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function updateCategoryById(
  categoryId: number,
  updates: Partial<Category>
): Promise<Category | undefined> {
  try {
    const dbRecord = transformCategoryToDb(updates);
    const result = await db
      .update(category)
      .set(dbRecord)
      .where(eq(category.id, categoryId))
      .returning();

    if (result.length === 0) {
      return undefined;
    }

    return transformDbToCategory(result[0]);
  } catch (error) {
    console.log('error on update category by id. ID:  ', categoryId);
    console.log(error);
    throw error;
  }
}

export async function getCategoryById(categoryId: number): Promise<Category | undefined> {
  try {
    const result = await db.select().from(category).where(eq(category.id, categoryId)).limit(1);

    if (result.length === 0) {
      return undefined;
    }

    const _category = transformDbToCategory(result[0]);
    return _category;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteCategoryById(categoryId: number): Promise<void> {
  try {
    await db.delete(category).where(eq(category.id, categoryId));
  } catch (error) {
    console.log(error);
  }
}
