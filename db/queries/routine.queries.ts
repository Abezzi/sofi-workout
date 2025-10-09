import { Routine, routine } from '../schema';
import { db } from '..';

export function transformDbToRoutine(dbRecord: any): Routine {
  return {
    id: dbRecord.id,
    name: dbRecord.name,
    restMode: dbRecord.restMode,
  };
}

export function transformRoutineToDb(routine: Partial<Routine>): any {
  const dbRecord: any = {};

  if (routine.id !== undefined) dbRecord.id = routine.id;
  if (routine.name !== undefined) dbRecord.name = routine.name;
  if (routine.restMode !== undefined) dbRecord.restMode = routine.restMode;

  return dbRecord;
}

export async function postRoutine(
  routineToPost: Routine
): Promise<{ success: boolean; id?: number }> {
  try {
    const result = await db.insert(routine).values({
      name: routineToPost.name,
      restMode: routineToPost.restMode,
    });
    return { success: true, id: result.lastInsertRowId };
  } catch (error) {
    console.log(error);
    return { success: false };
  }
}

export async function getAllRoutines(): Promise<Routine[]> {
  try {
    const result = await db.select().from(routine);

    if (result.length === 0) {
      return [];
    }

    return result.map(transformDbToRoutine);
  } catch (error) {
    console.log(error);
    throw error;
  }
}
