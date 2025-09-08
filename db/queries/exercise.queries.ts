import { Exercise, exercise } from '../schema';
import { eq } from 'drizzle-orm';
import { db } from '..';

export function transformDbToExercise(dbRecord: any): Exercise {
  return {
    id: dbRecord.id,
    name: dbRecord.name,
    description: dbRecord.description,
    categoryId: dbRecord.categoryId,
    exerciseTypeId: dbRecord.exerciseTypeId,
  };
}

export function transformExerciseToDb(exercise: Partial<Exercise>): any {
  const dbRecord: any = {};

  if (exercise.id !== undefined) dbRecord.id = exercise.id;
  if (exercise.name !== undefined) dbRecord.name = exercise.name;
  if (exercise.description !== undefined) {
    dbRecord.description = exercise.description;
  }
  if (exercise.categoryId !== undefined) {
    dbRecord.categoryId = exercise.categoryId;
  }
  if (exercise.exerciseTypeId !== undefined) {
    dbRecord.exerciseTypeId = exercise.exerciseTypeId;
  }

  return dbRecord;
}

export async function getAllExercises(): Promise<Exercise[]> {
  try {
    const result = await db.select().from(exercise);

    if (result.length === 0) {
      return [];
    }

    return result.map(transformDbToExercise);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function postExercise(exerciseToPost: Exercise): Promise<boolean> {
  try {
    await db.insert(exercise).values({
      name: exerciseToPost.name,
      description: exerciseToPost.description,
      categoryId: exerciseToPost.categoryId,
      exerciseTypeId: exerciseToPost.exerciseTypeId,
    });
    return true;
  } catch (error) {
    console.log(error);
    throw false;
  }
}

export async function getAllExercisesByCategoryId(categoryId: number): Promise<Exercise[]> {
  try {
    const result = await db.select().from(exercise).where(eq(exercise.categoryId, categoryId));

    if (result.length === 0) {
      return [];
    }

    return result.map(transformDbToExercise);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function deleteExerciseById(exerciseId: number): Promise<void> {
  try {
    await db.delete(exercise).where(eq(exercise.id, exerciseId));
  } catch (error) {
    console.log(error);
  }
}

export async function updateExerciseById(
  exerciseId: number,
  updates: Partial<Exercise>
): Promise<Exercise | undefined> {
  try {
    const dbRecord = transformExerciseToDb(updates);
    const result = await db
      .update(exercise)
      .set(dbRecord)
      .where(eq(exercise.id, exerciseId))
      .returning();

    if (result.length === 0) {
      return undefined;
    }

    return transformDbToExercise(result[0]);
  } catch (error) {
    console.log('error on update category by id. ID:  ', exerciseId);
    console.log(error);
    throw error;
  }
}

export async function getExerciseById(exerciseId: number): Promise<Exercise | undefined> {
  try {
    const result = await db.select().from(exercise).where(eq(exercise.id, exerciseId)).limit(1);

    if (result.length === 0) {
      return undefined;
    }

    const _exercise = transformDbToExercise(result[0]);
    return _exercise;
  } catch (error) {
    console.log(error);
  }
}
