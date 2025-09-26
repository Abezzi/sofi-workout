import { eq } from 'drizzle-orm';
import { ExerciseType, exercise_type } from '../schema';
import { db } from '..';

export function transformDbToExerciseType(dbRecord: any): ExerciseType {
  return {
    id: dbRecord.id,
    name: dbRecord.name,
  };
}

export function transformExerciseTypeToDb(exercise_type: Partial<ExerciseType>): any {
  const dbRecord: any = {};

  if (exercise_type.id !== undefined) dbRecord.id = exercise_type.id;
  if (exercise_type.name !== undefined) dbRecord.name = exercise_type.name;

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
