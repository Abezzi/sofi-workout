import {
  category,
  exercise,
  exercise_set,
  exercise_type,
  rest_timer,
  Routine,
  routine,
  routine_exercise,
} from '../schema';
import { eq, and, asc } from 'drizzle-orm';
import { db, DBTransaction, DBExecutor } from '..';

export interface RoutineWithExerciseAndRest {
  id: number;
  name: string;
  description: string;
  restMode: 'automatic' | 'manual';
  exercises: {
    id: number;
    name: string;
    description: string | null;
    category: { id: number; name: string; color: string } | null;
    exerciseType: { id: number; name: string } | null;
    sets: {
      id: number;
      routineExerciseId: number;
      setNumber: number;
      quantity: number;
      weight: number;
    }[];
  }[];
  restTimers: {
    id: number;
    routineId: number;
    routineExerciseId: number | null;
    exerciseSetId: number | null;
    restTime: number;
    type: 'set' | 'exercise';
  }[];
}

export interface SaveFullRoutineParams {
  routine: Omit<Routine, 'id'>;
  exercises: {
    exerciseId: number;
    position: number;
    sets: { quantity: number; weight: number }[];
  }[];
  restMode: 'automatic' | 'manual';
  setRest?: number;
  restBetweenExercise?: number;
}

export function transformDbToRoutine(dbRecord: any): Routine {
  return {
    id: dbRecord.id,
    name: dbRecord.name,
    description: dbRecord.description,
    restMode: dbRecord.restMode,
  };
}

function transformDbToRoutineExerciseAndRest(dbRecord: any[]): RoutineWithExerciseAndRest {
  const routineMap = new Map<number, any>();

  for (const row of dbRecord) {
    const r = row.routine;
    const re = row.routine_exercise;
    const ex = row.exercise;
    const cat = row.category;
    const et = row.exercise_type;
    const set = row.exercise_set;

    // initialize routine if not exists
    if (!routineMap.has(r.id)) {
      routineMap.set(r.id, {
        id: r.id,
        name: r.name,
        description: r.description,
        restMode: r.restMode,
        exercises: [],
        restTimers: [],
      });
    }

    const routineData = routineMap.get(r.id);

    // find exercise entry
    let exerciseEntry = routineData.exercises.find((e: any) => e.id === re.id);

    if (!exerciseEntry) {
      exerciseEntry = {
        id: re.id,
        routineId: re.routineId,
        exerciseId: re.exerciseId,
        position: re.position, // ← Keep this!
        name: ex.name,
        description: ex.description,
        exerciseType: et ? { id: et.id, name: et.name } : null,
        category: cat ? { id: cat.id, name: cat.name, color: cat.color } : null,
        sets: [],
      };
      routineData.exercises.push(exerciseEntry);
    }

    // add set if exists and not duplicate
    if (set) {
      const existingSet = exerciseEntry.sets.find((s: any) => s.id === set.id);
      if (!existingSet) {
        exerciseEntry.sets.push({
          id: set.id,
          routineExerciseId: set.routineExerciseId,
          setNumber: set.setNumber,
          quantity: set.quantity,
          weight: set.weight,
        });
      }
    }
  }

  const result = routineMap.values().next().value;

  // sort sets within each exercise
  if (result) {
    result.exercises.forEach((ex: any) => {
      ex.sets.sort((a: any, b: any) => a.setNumber - b.setNumber);
    });
  }

  return result;
}

export function transformRoutineToDb(routine: Partial<Routine>): any {
  const dbRecord: any = {};

  if (routine.id !== undefined) dbRecord.id = routine.id;
  if (routine.name !== undefined) dbRecord.name = routine.name;
  if (routine.description !== undefined) dbRecord.description = routine.description;
  if (routine.restMode !== undefined) dbRecord.restMode = routine.restMode;

  return dbRecord;
}

export async function postRoutine(
  routineToPost: Omit<Routine, 'id'>,
  executor?: DBExecutor
): Promise<{ success: boolean; id?: number }> {
  const dbOrTx = executor ?? db;

  try {
    const result = await dbOrTx
      .insert(routine)
      .values({
        name: routineToPost.name,
        description: routineToPost.description,
        restMode: routineToPost.restMode,
      })
      .returning({ id: routine.id });

    return { success: true, id: result[0].id };
  } catch (e) {
    console.error('postRoutine error', e);
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

export async function getRoutineById(routineId: number): Promise<Routine | undefined> {
  try {
    const result = await db.select().from(routine).where(eq(routine.id, routineId)).limit(1);

    if (result.length === 0) {
      return undefined;
    }

    const _routine = transformDbToRoutine(result[0]);
    return _routine;
  } catch (error) {
    console.log(error);
  }
}

export async function getRoutineWithExerciseAndRest(
  routineId: number
): Promise<RoutineWithExerciseAndRest | undefined> {
  console.log('inside getRoutineWithExerciseAndRest');
  try {
    return await db.transaction(async (tx) => {
      // routine + exercises + sets WITHOUT rest_timer to avoid duplicates since it is restMode: Automatic
      const mainData = await tx
        .select()
        .from(routine)
        .leftJoin(routine_exercise, eq(routine.id, routine_exercise.routineId))
        .leftJoin(exercise, eq(routine_exercise.exerciseId, exercise.id))
        .leftJoin(category, eq(exercise.categoryId, category.id))
        .leftJoin(exercise_type, eq(exercise.exerciseTypeId, exercise_type.id))
        .leftJoin(exercise_set, eq(routine_exercise.id, exercise_set.routineExerciseId))
        .where(and(eq(routine.restMode, 'automatic'), eq(routine.id, routineId)))
        .orderBy(asc(routine_exercise.position));

      if (mainData.length === 0) {
        return undefined;
      }

      // transform main data (restTimers will be [])
      let transformed = transformDbToRoutineExerciseAndRest(mainData);

      // query for rest timers
      const restTimersRaw = await tx
        .select()
        .from(rest_timer)
        .where(eq(rest_timer.routineId, routineId)); // Assumes routineId values in data

      // map to interface shape and assign (overrides empty array)
      transformed.restTimers = restTimersRaw.map((rt) => ({
        id: rt.id,
        routineId: rt.routineId,
        routineExerciseId: rt.routineExerciseId || null,
        exerciseSetId: rt.exerciseSetId || null,
        restTime: rt.restTime,
        type: rt.type,
      }));

      // sort rest timers by id or type if needed
      transformed.restTimers.sort((a, b) => a.id - b.id);

      return transformed;
    });
  } catch (error) {
    console.log('Error in getRoutineWithExerciseAndRest:', error);
    return undefined;
  }
}

export async function getRoutinesWithExerciseAndRest(): Promise<RoutineWithExerciseAndRest[]> {
  try {
    return await db.transaction(async (tx) => {
      // fetch all routines with their exercises and sets
      const mainData = await tx
        .select()
        .from(routine)
        .leftJoin(routine_exercise, eq(routine.id, routine_exercise.routineId))
        .leftJoin(exercise, eq(routine_exercise.exerciseId, exercise.id))
        .leftJoin(category, eq(exercise.categoryId, category.id))
        .leftJoin(exercise_type, eq(exercise.exerciseTypeId, exercise_type.id))
        .leftJoin(exercise_set, eq(routine_exercise.id, exercise_set.routineExerciseId))
        .where(eq(routine.restMode, 'automatic'));

      if (mainData.length === 0) {
        return [];
      }
      const restTimersRaw = await tx.select().from(rest_timer);

      // group mainData by routineId
      const routinesMap = new Map<number, any[]>();
      mainData.forEach((record) => {
        const routineId = record.routine.id;
        if (!routinesMap.has(routineId)) {
          routinesMap.set(routineId, []);
        }
        routinesMap.get(routineId)!.push(record);
      });

      // transform each routine
      const routines: RoutineWithExerciseAndRest[] = [];
      for (const [routineId, records] of routinesMap) {
        let transformed = transformDbToRoutineExerciseAndRest(records);

        // filter and map rest timers
        transformed.restTimers = restTimersRaw
          .filter((rt) => rt.routineId === routineId)
          .map((rt) => ({
            id: rt.id,
            routineId: rt.routineId,
            routineExerciseId: rt.routineExerciseId || null,
            exerciseSetId: rt.exerciseSetId || null,
            restTime: rt.restTime,
            type: rt.type,
          }));

        // sort rest timers by id
        transformed.restTimers.sort((a, b) => a.id - b.id);

        routines.push(transformed);
      }

      // Sort routines by id
      routines.sort((a, b) => a.id - b.id);

      return routines;
    });
  } catch (error) {
    console.log('Error in getRoutinesWithExerciseAndRest:', error);
    return [];
  }
}

export async function deleteRoutineById(routineId: number): Promise<void> {
  try {
    await db.delete(routine).where(eq(routine.id, routineId));
  } catch (error) {
    console.log(error);
  }
}

export async function saveFullRoutine(
  params: SaveFullRoutineParams
): Promise<{ success: boolean; routineId?: number; error?: any }> {
  return db.transaction(async (tx: DBTransaction) => {
    try {
      // insert routine
      const routineRes = await postRoutine(params.routine, tx);
      if (!routineRes.success || !routineRes.id) {
        throw new Error('failed to create routine');
      }
      const routineId = routineRes.id;

      // routine exercise
      const reValues = params.exercises.map((ex) => ({
        routineId,
        exerciseId: ex.exerciseId,
        position: ex.position,
      }));

      const reBulk = await tx
        .insert(routine_exercise)
        .values(reValues)
        .returning({ id: routine_exercise.id, position: routine_exercise.position });

      // map position -> routine_exercise.id (needed for sets)
      const reIdMap = new Map<number, number>();
      reBulk.forEach((row) => reIdMap.set(row.position, row.id));

      // exercise set
      const setValues: any[] = [];
      params.exercises.forEach((ex) => {
        const reId = reIdMap.get(ex.position);
        if (!reId) throw new Error(`missing routine_exercise for pos ${ex.position}`);

        ex.sets.forEach((s, idx) => {
          setValues.push({
            routineExerciseId: reId,
            setNumber: idx + 1,
            quantity: s.quantity,
            weight: s.weight,
          });
        });
      });

      if (setValues.length) {
        await tx.insert(exercise_set).values(setValues);
      }
      // rest timers
      if (
        params.restMode === 'automatic' &&
        params.setRest != null &&
        params.restBetweenExercise != null
      ) {
        const timerValues = [
          {
            routineId,
            restTime: params.setRest,
            type: 'set' as const,
          },
          {
            routineId,
            restTime: params.restBetweenExercise,
            type: 'exercise' as const,
          },
        ];
        await tx.insert(rest_timer).values(timerValues);
      }

      return { success: true, routineId };
    } catch (error) {
      console.error('error saving full routine, rollback', error);
      return { success: false, error: error };
    }
  });
}
