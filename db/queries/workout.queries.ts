import { db } from '@/db';
import { eq, gte, lte, and, desc, count, sum, countDistinct, sql } from 'drizzle-orm';
import { workout, workout_exercise, workout_set, workout_rest_timer, routine } from '@/db/schema';
import { Step } from '@/types/workout';
import { InferInsertModel } from 'drizzle-orm';
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export type PerformedExercise = {
  exerciseId: number;
  position: number;
  sets: Array<{
    setNumber: number;
    quantity: number;
    weight?: number | null;
    completedAt?: string | null;
  }>;
  restAfterExerciseSeconds?: number;
};

type WorkoutInsert = InferInsertModel<typeof workout>;
type WorkoutExerciseInsert = InferInsertModel<typeof workout_exercise>;
type WorkoutSetInsert = InferInsertModel<typeof workout_set>;
type WorkoutRestTimerInsert = InferInsertModel<typeof workout_rest_timer>;

export type SaveWorkoutInput = {
  // userId: string;
  routineId?: number | null;
  completedAt: string;
  durationSeconds: number;
  notes?: string | null;
  steps: Step[];
  actualRests?: Array<{
    restTime: number;
    type: 'set' | 'exercise';
    workoutExerciseId?: number;
    workoutSetId?: number;
    position?: number;
  }>;
};

export type WorkoutHistoryItem = {
  id: number;
  completedAt: string;
  duration: number | null;
  notes: string | null;
  routineName: string | null;
  exerciseCount: number;
  totalSets: number;
  totalVolume: number | null; // weight * quantity sum
};

export type WorkoutHistorySummary = {
  totalWorkouts: number;
  totalDurationSeconds: number;
  totalExercises: number;
  totalSets: number;
  totalVolume: number | null;
  items: WorkoutHistoryItem[];
};

export type DateRangePeriod = 'month' | 'year' | 'custom';

export type GetWorkoutHistoryParams = {
  // userId: string;
  period?: DateRangePeriod;
  referenceDate?: Date;
  customRange?: { start: Date; end: Date };
};

export async function saveCompletedWorkout(input: SaveWorkoutInput): Promise<number> {
  const {
    // userId,
    routineId,
    completedAt,
    durationSeconds,
    notes,
    steps,
    actualRests = [],
  } = input;

  return db.transaction(async (tx) => {
    // 1. Create workout
    // FIXME: vvv
    if (!routineId) return 0;

    const [newWorkout] = await tx
      .insert(workout)
      .values({
        // userId,
        routineId: routineId ?? null,
        completedAt,
        duration: durationSeconds,
        notes: notes ?? null,
      } satisfies WorkoutInsert)
      .returning({ id: workout.id });

    const workoutId = newWorkout.id;

    // 2. Group consecutive sets of the same exercise
    const exerciseGroups: Array<{
      exerciseId: number;
      position: number;
      sets: Array<{
        setNumber: number;
        quantity: number;
        weight: number | null;
      }>;
    }> = [];

    let currentGroup: (typeof exerciseGroups)[number] | null = null;
    let positionCounter = 1;

    steps.forEach((step) => {
      if (step.isRest || !step.exerciseId) {
        currentGroup = null; // reset grouping on rest
        return;
      }

      if (
        currentGroup?.exerciseId === step.exerciseId &&
        step.name.includes('- Set ') // heuristic safety check
      ) {
        // Continue current exercise block
        currentGroup.sets.push({
          setNumber: currentGroup.sets.length + 1,
          quantity: step.quantity,
          weight: step.weight ?? null,
        });
      } else {
        // New exercise block
        currentGroup = {
          exerciseId: step.exerciseId,
          position: positionCounter++,
          sets: [
            {
              setNumber: 1,
              quantity: step.quantity,
              weight: step.weight ?? null,
            },
          ],
        };
        exerciseGroups.push(currentGroup);
      }
    });

    // 3. Insert exercises and sets
    const workoutExerciseIdMap = new Map<number, number>(); // exerciseId → workout_exercise.id

    for (const group of exerciseGroups) {
      const [newEx] = await tx
        .insert(workout_exercise)
        .values({
          workoutId,
          exerciseId: group.exerciseId,
          position: group.position,
        } satisfies WorkoutExerciseInsert)
        .returning({ id: workout_exercise.id });

      workoutExerciseIdMap.set(group.exerciseId, newEx.id);

      if (group.sets.length > 0) {
        await tx.insert(workout_set).values(
          group.sets.map(
            (s) =>
              ({
                workoutExerciseId: newEx.id,
                setNumber: s.setNumber,
                quantity: s.quantity,
                weight: s.weight,
              }) satisfies WorkoutSetInsert
          )
        );
      }
    }

    // 4. Save planned rests (to compare between workout rest and actual workout rest)
    // maybe the plan was to rest 60s but the user took 80s, so the user rested 20 longer
    const restTimers: WorkoutRestTimerInsert[] = [];
    const plannedRestSteps = steps.filter((s) => s.isRest && s.quantity > 0);

    // planned rests
    plannedRestSteps.forEach((restStep, idx) => {
      restTimers.push({
        workoutId,
        workoutExerciseId: null,
        workoutSetId: null,
        position: idx + 1,
        restTime: restStep.quantity,
        type: 'exercise' as const,
        // planned rest
        isActual: false,
      });
    });

    // ACTUAL rests (from tracking)
    actualRests.forEach((actualRest) => {
      restTimers.push({
        workoutId,
        workoutExerciseId: actualRest.workoutExerciseId ?? null,
        workoutSetId: actualRest.workoutSetId ?? null,
        position: actualRest.position ?? restTimers.length + 1,
        restTime: actualRest.restTime,
        type: actualRest.type,
        // actual rest (the rest that the user took 'REAL')
        isActual: true,
      });
    });

    if (restTimers.length > 0) {
      await tx.insert(workout_rest_timer).values(restTimers);
    }

    return workoutId;
  });
}

/**
 * Fetches workout history for a given period with aggregated data
 */
export async function getWorkoutHistory({
  // userId,
  period = 'month',
  referenceDate = new Date(),
  customRange,
}: GetWorkoutHistoryParams): Promise<WorkoutHistorySummary> {
  console.log('inside getWorkoutHistory');
  let startDate: Date;
  let endDate: Date;

  if (period === 'custom' && customRange) {
    startDate = customRange.start;
    endDate = customRange.end;
  } else if (period === 'year') {
    startDate = startOfYear(referenceDate);
    endDate = endOfYear(referenceDate);
  } else {
    // default: current month
    startDate = startOfMonth(referenceDate);
    endDate = endOfMonth(referenceDate);
  }

  const startIso = startDate.toISOString();
  const endIso = endDate.toISOString();

  const results = await db
    .select({
      id: workout.id,
      completedAt: workout.completedAt,
      duration: workout.duration,
      notes: workout.notes,
      routineName: routine.name, // will be null if no routine
      exerciseCount: countDistinct(workout_exercise.id).as('exercise_count'),
      totalSets: count(workout_set.id).as('total_sets'),
      totalVolume: sql<number>`sum(${workout_set.weight} * ${workout_set.quantity})`.as(
        'total_volume'
      ),
    })
    .from(workout)
    .leftJoin(routine, eq(workout.routineId, routine.id))
    .leftJoin(workout_exercise, eq(workout_exercise.workoutId, workout.id))
    .leftJoin(workout_set, eq(workout_set.workoutExerciseId, workout_exercise.id))
    .where(
      and(
        // eq(workout.userId, userId),
        gte(workout.completedAt, startIso),
        lte(workout.completedAt, endIso)
      )
    )
    .groupBy(workout.id, workout.completedAt, workout.duration, workout.notes, routine.name)
    .orderBy(desc(workout.completedAt));

  // Post-process for summary TODO: validate the completedAt instead of ??
  const items: WorkoutHistoryItem[] = results.map((r) => ({
    id: r.id,
    completedAt: r.completedAt ?? '',
    duration: r.duration,
    notes: r.notes,
    routineName: r.routineName,
    exerciseCount: Number(r.exerciseCount) || 0,
    totalSets: Number(r.totalSets) || 0,
    totalVolume: r.totalVolume ? Number(r.totalVolume) : null,
  }));

  const totalWorkouts = items.length;
  const totalDurationSeconds = items.reduce((sum, w) => sum + (w.duration ?? 0), 0);
  const totalExercises = items.reduce((sum, w) => sum + w.exerciseCount, 0);
  const totalSets = items.reduce((sum, w) => sum + w.totalSets, 0);
  const totalVolume = items.reduce((sum, w) => sum + (w.totalVolume ?? 0), 0);

  return {
    totalWorkouts,
    totalDurationSeconds,
    totalExercises,
    totalSets,
    totalVolume: totalVolume > 0 ? totalVolume : null,
    items,
  };
}
