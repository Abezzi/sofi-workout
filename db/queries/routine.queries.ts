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
import { eq, and } from 'drizzle-orm';
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

export function transformDbToRoutineExerciseAndRest(dbRecord: any[]): RoutineWithExerciseAndRest {
  // if no data is provided or first record is invalid, return an empty routine object
  if (!dbRecord || dbRecord.length === 0 || !dbRecord[0]?.routine) {
    return {
      id: 0,
      name: '',
      description: '',
      restMode: 'manual',
      exercises: [],
      restTimers: [],
    };
  }

  // the first record contains the routine data
  const routineData = dbRecord[0];

  // initialize the Routine object
  const routine: RoutineWithExerciseAndRest = {
    id: routineData.routine.id,
    name: routineData.routine.name,
    description: routineData.routine.description,
    restMode: routineData.routine.restMode,
    exercises: [],
    restTimers: [],
  };

  // map to track unique exercises by routine_exercise.id
  const exerciseMap = new Map<number, any>();

  // aggregate exercises
  dbRecord.forEach((record) => {
    if (record.routine_exercise && record.exercise) {
      const routineExerciseId = record.routine_exercise.id;

      if (!exerciseMap.has(routineExerciseId)) {
        exerciseMap.set(routineExerciseId, {
          id: record.exercise.id,
          name: record.exercise.name,
          description: record.exercise.description || null,
          category: record.category
            ? { id: record.category.id, name: record.category.name, color: record.category.color }
            : null,
          exerciseType: record.exercise_type
            ? { id: record.exercise_type.id, name: record.exercise_type.name }
            : null,
          sets: [],
        });
      }

      // add set (no dedup check needed)
      if (record.exercise_set) {
        const exercise = exerciseMap.get(routineExerciseId);
        exercise.sets.push({
          id: record.exercise_set.id,
          routineExerciseId: record.exercise_set.routineExerciseId,
          setNumber: record.exercise_set.setNumber,
          quantity: record.exercise_set.quantity,
          weight: record.exercise_set.weight,
        });
      }
    }

    // add rest timer data if available
    if (record.rest_timer && !routine.restTimers.some((rt) => rt.id === record.rest_timer.id)) {
      routine.restTimers.push({
        id: record.rest_timer.id,
        routineId: record.rest_timer.routineId,
        routineExerciseId: record.rest_timer.routineExerciseId || null,
        exerciseSetId: record.rest_timer.exerciseSetId || null,
        restTime: record.rest_timer.restTime,
        type: record.rest_timer.type,
      });
    }
  });

  // convert exerciseMap to array and sort by routine_exercise.position
  routine.exercises = Array.from(exerciseMap.values()).sort((a, b) => {
    const positionA =
      dbRecord.find((r) => r.exercise && r.exercise.id === a.id)?.routine_exercise?.position || 0;
    const positionB =
      dbRecord.find((r) => r.exercise && r.exercise.id === b.id)?.routine_exercise?.position || 0;
    return positionA - positionB;
  });

  // sort sets within each exercise by setNumber
  routine.exercises.forEach((exercise) => {
    exercise.sets.sort((a: any, b: any) => a.setNumber - b.setNumber);
  });

  // sort rest timers by id
  routine.restTimers.sort((a, b) => a.id - b.id);

  return routine;
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
        .where(and(eq(routine.restMode, 'automatic'), eq(routine.id, routineId)));

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
