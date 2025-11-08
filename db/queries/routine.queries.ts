import {
  category,
  exercise,
  exercise_set,
  exercise_type,
  rest_timer,
  RestTimer,
  Routine,
  routine,
  routine_exercise,
} from '../schema';
import { eq, asc, inArray } from 'drizzle-orm';
import { db, DBTransaction, DBExecutor } from '..';
import { ExerciseItem } from '@/types/workout';

export interface RoutineWithExerciseAndRest {
  id: number;
  name: string;
  description: string;
  restMode: 'automatic' | 'manual';
  exercises: {
    id: number;
    exerciseId?: number | null;
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
  restSeconds?: number;
  exercises: {
    exerciseId: number | null;
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

function transformDbToRoutineExerciseAndRest(
  mainData: any[],
  restTimersRaw: RestTimer[]
): RoutineWithExerciseAndRest | null {
  const routineMap = new Map<number, any>();

  for (const row of mainData) {
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

    // only if it's a real exercise
    if (re && ex) {
      let exerciseEntry = routineData.exercises.find((e: any) => e.id === re.id);
      if (!exerciseEntry) {
        exerciseEntry = {
          id: re.id,
          routineId: re.routineId,
          exerciseId: re.exerciseId,
          position: re.position,
          name: ex.name,
          description: ex.description,
          exerciseType: et ? { id: et.id, name: et.name } : null,
          category: cat ? { id: cat.id, name: cat.name, color: cat.color } : null,
          sets: [],
          _type: 'exercise' as const,
        };
        routineData.exercises.push(exerciseEntry);
      }

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
  }

  const result = routineMap.values().next().value;
  if (!result) return null;

  const manualRests = restTimersRaw
    .filter(
      (rt) =>
        rt.type === 'exercise' &&
        rt.routineExerciseId === null &&
        rt.exerciseSetId === null &&
        rt.position !== null &&
        rt.position !== undefined
    )
    .map((rt) => ({
      _type: 'rest' as const,
      id: `rest-${rt.id}`,
      position: rt.position,
      restSeconds: rt.restTime,
      name: 'Rest',
      description: 'Rest period',
      exerciseId: null,
      exercise: { id: -1, name: `Rest ${rt.restTime}s`, description: '' },
      category: { id: -1, name: 'Rest', color: '#94a3b8' },
      exerciseType: 2,
      sets: [{ quantity: rt.restTime, weight: 0 }],
      // reference
      restTimerId: rt.id,
    }));

  // merge exercises + rests by position
  const allItems = [
    ...result.exercises.map((ex: any) => ({ ...ex, _type: 'exercise' as const })),
    ...manualRests,
  ];

  // sort by position (for drag-and-drop order)
  allItems.sort((a, b) => a.position - b.position);

  // rebuild exercises array with rests interleaved
  result.exercises = allItems.map((item) => {
    if (item._type === 'rest') {
      return {
        id: item.id,
        exerciseId: null,
        position: item.position,
        name: item.name,
        description: item.description,
        category: item.category,
        exerciseType: null,
        sets: item.sets,
      };
    }
    // real exercise with _type
    const { _type, ...cleanEx } = item;
    return cleanEx;
  });

  // sort sets inside each exercise
  result.exercises.forEach((ex: any) => {
    if (ex.sets) {
      ex.sets.sort((a: any, b: any) => a.setNumber - b.setNumber);
    }
  });

  // populate rest timers
  result.restTimers = restTimersRaw.map((rt) => ({
    id: rt.id,
    routineId: rt.routineId,
    routineExerciseId: rt.routineExerciseId || null,
    exerciseSetId: rt.exerciseSetId || null,
    restTime: rt.restTime,
    type: rt.type,
  }));

  result.restTimers.sort((a: { id: number }, b: { id: number }) => a.id - b.id);

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
  try {
    return await db.transaction(async (tx) => {
      // 1. retrieve data
      const mainData = await tx
        .select()
        .from(routine)
        .leftJoin(routine_exercise, eq(routine.id, routine_exercise.routineId))
        .leftJoin(exercise, eq(routine_exercise.exerciseId, exercise.id))
        .leftJoin(category, eq(exercise.categoryId, category.id))
        .leftJoin(exercise_type, eq(exercise.exerciseTypeId, exercise_type.id))
        .leftJoin(exercise_set, eq(routine_exercise.id, exercise_set.routineExerciseId))
        .where(eq(routine.id, routineId))
        .orderBy(asc(routine_exercise.position));

      if (mainData.length === 0) {
        return undefined;
      }

      // 2. retrieve rest timers
      const restTimersRaw = await tx
        .select()
        .from(rest_timer)
        .where(eq(rest_timer.routineId, routineId))
        .orderBy(asc(rest_timer.position));

      // transform with both datasets
      let transformed = transformDbToRoutineExerciseAndRest(mainData, restTimersRaw);
      // console.debug('transformed: ', JSON.stringify(transformed, null, 2));
      return transformed || undefined;
    });
  } catch (error) {
    console.error('Error in getRoutineWithExerciseAndRest:', error);
    return undefined;
  }
}

export async function getRoutinesWithExerciseAndRest(): Promise<RoutineWithExerciseAndRest[]> {
  try {
    return await db.transaction(async (tx) => {
      // 1. fetch all routines with their exercises and sets
      const mainData = await tx
        .select()
        .from(routine)
        .leftJoin(routine_exercise, eq(routine.id, routine_exercise.routineId))
        .leftJoin(exercise, eq(routine_exercise.exerciseId, exercise.id))
        .leftJoin(category, eq(exercise.categoryId, category.id))
        .leftJoin(exercise_type, eq(exercise.exerciseTypeId, exercise_type.id))
        .leftJoin(exercise_set, eq(routine_exercise.id, exercise_set.routineExerciseId))
        .orderBy(asc(routine.id), asc(routine_exercise.position));

      if (mainData.length === 0) {
        return [];
      }

      // 2. fetch rest timers
      const restTimersRaw = await tx
        .select()
        .from(rest_timer)
        .orderBy(asc(rest_timer.routineId), asc(rest_timer.position));

      // 3. group mainData by routineId
      const routinesMap = new Map<number, any[]>();
      mainData.forEach((record) => {
        if (!record.routine) return;
        const routineId = record.routine.id;
        if (!routinesMap.has(routineId)) {
          routinesMap.set(routineId, []);
        }
        routinesMap.get(routineId)!.push(record);
      });

      // 4. transform each routine
      const routines: RoutineWithExerciseAndRest[] = [];

      for (const [routineId, records] of routinesMap) {
        // filter rest timers for this routine
        const routineRestTimers = restTimersRaw.filter((rt) => rt.routineId === routineId);
        const transformed = transformDbToRoutineExerciseAndRest(records, routineRestTimers);

        if (transformed) {
          transformed.restTimers = routineRestTimers.map((rt) => ({
            id: rt.id,
            routineId: rt.routineId,
            routineExerciseId: rt.routineExerciseId ?? null,
            exerciseSetId: rt.exerciseSetId ?? null,
            restTime: rt.restTime,
            type: rt.type,
          }));

          transformed.restTimers.sort((a, b) => a.id - b.id);

          routines.push(transformed);
        }
      }

      // sort final list by routine ID
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
      // 1. insert routine
      const routineRes = await postRoutine(params.routine, tx);
      if (!routineRes.success || !routineRes.id) {
        throw new Error('failed to create routine');
      }
      const routineId = routineRes.id;

      // 2. separate real exercise from rest entries
      const realExercises = params.exercises.filter((ex) => ex.exerciseId !== null);
      const restEntries = params.exercises.filter((ex) => ex.exerciseId === null);

      // 3. insert (only real exercises) into routine_exercise (not rest)
      const reIdMap = new Map<number, number>();

      if (realExercises.length > 0) {
        const reValues = realExercises.map((ex) => ({
          routineId,
          // guaranteed non-null
          exerciseId: ex.exerciseId!,
          position: ex.position,
        }));

        const reBulk = await tx
          .insert(routine_exercise)
          .values(reValues)
          .returning({ id: routine_exercise.id, position: routine_exercise.position });

        reBulk.forEach((row) => reIdMap.set(row.position, row.id));
      }

      // 4. insert sets (only for real exercises)
      const setValues: any[] = [];
      realExercises.forEach((ex) => {
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

      if (setValues.length > 0) {
        await tx.insert(exercise_set).values(setValues);
      }

      // 5. rest timers
      const restTimerValues: any[] = [];

      // automatic rest mode
      if (params.restMode === 'automatic') {
        if (params.setRest != null && params.restBetweenExercise != null) {
          restTimerValues.push(
            {
              routineId,
              routineExerciseId: null,
              exerciseSetId: null,
              restTime: params.setRest,
              type: 'set' as const,
              position: null, // no position needed for global
            },
            {
              routineId,
              routineExerciseId: null,
              exerciseSetId: null,
              restTime: params.restBetweenExercise,
              type: 'exercise' as const,
              position: null,
            }
          );
        }
      }

      // manual rest mode
      if (params.restMode === 'manual') {
        restEntries.forEach((restEx) => {
          const restSeconds = restEx.sets[0]?.quantity;
          restTimerValues.push({
            routineId,
            routineExerciseId: null,
            exerciseSetId: null,
            restTime: restSeconds,
            type: 'exercise' as const,
            position: restEx.position,
          });
        });
      }

      if (restTimerValues.length > 0) {
        await tx.insert(rest_timer).values(restTimerValues);
      }

      return { success: true, routineId };
    } catch (error) {
      console.error('error saving full routine, rollback', error);
      return { success: false, error: error };
    }
  });
}

export async function updateRoutineName(routineId: number, name: string): Promise<void> {
  await db.update(routine).set({ name }).where(eq(routine.id, routineId));
}

export async function saveRoutineExercisesAndRest(
  routineId: number,
  items: ExerciseItem[]
): Promise<{ success: boolean; error?: any }> {
  return db.transaction(async (tx) => {
    try {
      // 1. delete all existing data for this routine
      await tx.delete(rest_timer).where(eq(rest_timer.routineId, routineId));

      await tx
        .delete(exercise_set)
        .where(
          inArray(
            exercise_set.routineExerciseId,
            tx
              .select({ id: routine_exercise.id })
              .from(routine_exercise)
              .where(eq(routine_exercise.routineId, routineId))
          )
        );

      await tx.delete(routine_exercise).where(eq(routine_exercise.routineId, routineId));

      // 2. re-insert in new order
      // position -> routine_exercise.id
      const reIdMap = new Map<number, number>();

      const routineExerciseValues: any[] = [];
      const exerciseSetValues: any[] = [];
      const restTimerValues: any[] = [];

      items.forEach((item, index) => {
        const position = index + 1;

        if (item.isRest) {
          // rest
          const restSeconds = item.restSeconds ?? item.amount[0]?.quantity ?? 60;

          restTimerValues.push({
            routineId,
            routineExerciseId: null,
            exerciseSetId: null,
            restTime: restSeconds,
            type: 'exercise' as const,
            position,
          });
        } else {
          // exercise
          routineExerciseValues.push({
            routineId,
            exerciseId: item.exercise.id,
            position,
            exerciseTypeId: item.exerciseTypeId,
          });

          // queue sets
          item.amount.forEach((set, setIdx) => {
            exerciseSetValues.push({
              // placeholder, will be filled after insert
              routineExerciseId: null as any,
              setNumber: setIdx + 1,
              quantity: set.quantity,
              weight: set.weight ?? 0,
            });
          });
        }
      });

      // 3. insert routine_exercise + get ids back
      if (routineExerciseValues.length > 0) {
        const insertedRE = await tx
          .insert(routine_exercise)
          .values(routineExerciseValues)
          .returning({ id: routine_exercise.id, position: routine_exercise.position });

        // map position -> routine_exercise.id
        insertedRE.forEach((row) => reIdMap.set(row.position, row.id));

        // fill in the real routineExerciseId in exerciseSetValues
        let setInsertIndex = 0;
        items.forEach((item, index) => {
          const position = index + 1;
          if (!item.isRest && item.amount.length > 0) {
            const reId = reIdMap.get(position);
            if (!reId) throw new Error(`Missing routine_exercise ID for position ${position}`);

            for (let i = 0; i < item.amount.length; i++) {
              exerciseSetValues[setInsertIndex].routineExerciseId = reId;
              setInsertIndex++;
            }
          } else if (!item.isRest) {
            // skip if no sets
            // no op
          } else {
            // rest -> skip sets
          }
        });

        // Insert all sets
        if (exerciseSetValues.length > 0) {
          await tx.insert(exercise_set).values(exerciseSetValues);
        }
      }

      // 4. insert rest timers (manual mode, per position)
      if (restTimerValues.length > 0) {
        await tx.insert(rest_timer).values(restTimerValues);
      }

      return { success: true };
    } catch (error) {
      console.error('saveRoutineExercisesAndRest error - rollback', error);
      return { success: false, error };
    }
  });
}
