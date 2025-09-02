import { eq } from 'drizzle-orm';
import { ExerciseType, exercise_type } from '../schema';
import { db } from '..';

export function transformDbToExerciseType(dbRecord: any): ExerciseType {
  return {
    id: dbRecord.id,
    name: dbRecord.name,
  };
}

export function transformExerciseTypeToDb(category: Partial<ExerciseType>): any {
  const dbRecord: any = {};

  if (category.id !== undefined) dbRecord.id = category.id;
  if (category.name !== undefined) dbRecord.name = category.name;

  return dbRecord;
}

export async function getAllExerciseType(): Promise<ExerciseType[]> {
  try {
    const result = await db.select().from(exercise_type);

    if (result.length === 0) {
      return [];
    }

    return result.map(transformDbToExerciseType);
  } catch (error) {
    console.log(error);
    throw error;
  }
}
