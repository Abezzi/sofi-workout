import { eq } from 'drizzle-orm';
import { ExerciseSet, exercise_set } from '../schema';
import { db } from '..';

export function transformDbToExerciseSet(dbRecord: any): ExerciseSet {
  return {
    id: dbRecord.id,
    setNumber: dbRecord.setNumber,
    quantity: dbRecord.quantity,
    weight: dbRecord.weight,
    routineExerciseId: dbRecord.routineExerciseId,
  };
}

export function transformExerciseSetToDb(exercise_set: Partial<ExerciseSet>): any {
  const dbRecord: any = {};

  if (exercise_set.id !== undefined) dbRecord.id = exercise_set.id;
  if (exercise_set.setNumber !== undefined) dbRecord.setNumber = exercise_set.setNumber;
  if (exercise_set.quantity !== undefined) dbRecord.quantity = exercise_set.quantity;
  if (exercise_set.weight !== undefined) dbRecord.weight = exercise_set.weight;
  if (exercise_set.routineExerciseId !== undefined)
    dbRecord.routineExerciseId = exercise_set.routineExerciseId;

  return dbRecord;
}

export async function postExerciseSet(
  exerciseSetToPost: ExerciseSet
): Promise<{ success: boolean }> {
  try {
    await db.insert(exercise_set).values({
      setNumber: exerciseSetToPost.setNumber,
      quantity: exerciseSetToPost.quantity,
      weight: exerciseSetToPost.weight,
      routineExerciseId: exerciseSetToPost.routineExerciseId,
    });
    return { success: true };
  } catch (error) {
    console.log(error);
    throw false;
  }
}
