import { RestTimer, rest_timer } from '../schema';
import { db } from '..';

export function transformDbToRestTimer(dbRecord: any): RestTimer {
  return {
    id: dbRecord.id,
    routineId: dbRecord.routineId,
    routineExerciseId: dbRecord.routineExerciseId,
    exerciseSetId: dbRecord.exerciseSetId,
    restTime: dbRecord.restTime,
    type: dbRecord.type,
  };
}

export function transformRestTimerToDb(rest_timer: Partial<RestTimer>): any {
  const dbRecord: any = {};

  if (rest_timer.id !== undefined) dbRecord.id = rest_timer.id;
  if (rest_timer.routineId !== undefined) dbRecord.routineId = rest_timer.routineId;
  if (rest_timer.routineExerciseId !== undefined)
    dbRecord.routineExerciseId = rest_timer.routineExerciseId;
  if (rest_timer.exerciseSetId !== undefined) dbRecord.exerciseSetId = rest_timer.exerciseSetId;
  if (rest_timer.restTime !== undefined) dbRecord.restTime = rest_timer.restTime;
  if (rest_timer.type !== undefined) dbRecord.type = rest_timer.type;

  return dbRecord;
}

export async function postRestTimer(restTimerToPost: RestTimer): Promise<{ success: boolean }> {
  try {
    await db.insert(rest_timer).values({
      routineId: restTimerToPost.routineId,
      routineExerciseId: restTimerToPost.routineExerciseId,
      exerciseSetId: restTimerToPost.exerciseSetId,
      restTime: restTimerToPost.restTime,
      type: restTimerToPost.type,
    });
    return { success: true };
  } catch (error) {
    console.log(error);
    throw false;
  }
}
