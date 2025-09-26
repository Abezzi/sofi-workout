import { eq } from 'drizzle-orm';
import { Routine, routine } from '../schema';
import { db } from '..';

export function transformDbToRoutine(dbRecord: any): Routine {
  return {
    id: dbRecord.id,
    name: dbRecord.name,
  };
}

export function transformRoutineToDb(routine: Partial<Routine>): any {
  const dbRecord: any = {};

  if (routine.id !== undefined) dbRecord.id = routine.id;
  if (routine.name !== undefined) dbRecord.name = routine.name;

  return dbRecord;
}

export async function postRoutine(
  routineToPost: Routine
): Promise<{ success: boolean; id?: number }> {
  try {
    const result = await db.insert(routine).values({
      name: routineToPost.name,
    });
    return { success: true, id: result.lastInsertRowId };
  } catch (error) {
    console.log(error);
    return { success: false };
  }
}
