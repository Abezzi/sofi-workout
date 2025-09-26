import { eq } from 'drizzle-orm';
import { RoutineExercise, routine_exercise } from '../schema';
import { db } from '..';

export function transformDbToRoutineExercise(dbRecord: any): RoutineExercise {
  return {
    id: dbRecord.id,
    routineId: dbRecord.routineId,
    exerciseId: dbRecord.exerciseId,
    position: dbRecord.position,
  };
}

export function transformRoutineExerciseToDb(routine_exercise: Partial<RoutineExercise>): any {
  const dbRecord: any = {};

  if (routine_exercise.id !== undefined) dbRecord.id = routine_exercise.id;
  if (routine_exercise.routineId !== undefined) dbRecord.routineId = routine_exercise.routineId;
  if (routine_exercise.exerciseId !== undefined) dbRecord.exerciseId = routine_exercise.exerciseId;
  if (routine_exercise.position !== undefined) dbRecord.position = routine_exercise.position;

  return dbRecord;
}

export async function postRoutineExercise(
  routineExerciseToPost: RoutineExercise
): Promise<{ success: boolean; id?: number }> {
  try {
    const result = await db.insert(routine_exercise).values({
      routineId: routineExerciseToPost.routineId,
      exerciseId: routineExerciseToPost.exerciseId,
      position: routineExerciseToPost.position,
    });
    return { success: true, id: result.lastInsertRowId };
  } catch (error) {
    console.log(error);
    return { success: false };
  }
}
