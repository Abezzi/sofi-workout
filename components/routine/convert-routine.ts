import { getRoutineWithExerciseAndRest } from '@/db/queries/routine.queries';
import { Step } from '@/types/workout';
import { TFunction } from 'i18next';

type RoutineExerciseItem = {
  id: number;
  exerciseId?: number | null;
  name: string;
  description?: string | null;
  category?: { id: number; name: string; color: string } | null;
  exerciseType?: { id: number; name: string } | null;
  sets: {
    id: number;
    routineExerciseId: number;
    setNumber: number;
    quantity: number;
    weight: number;
  }[];
};

export const convertRoutineToSteps = async (
  selectedRoutineId: number,
  t: TFunction
): Promise<Step[]> => {
  const steps: Step[] = [];
  let stepCount = 0;

  const routineData = await getRoutineWithExerciseAndRest(selectedRoutineId);
  if (!routineData) return steps;

  const isAutomatic = routineData.restMode === 'automatic';
  const setRestTimer = routineData.restTimers.find((rt) => rt.type === 'set');
  const exerciseRestTimer = routineData.restTimers.find((rt) => rt.type === 'exercise');

  // Global counter: exerciseId → total sets performed so far
  const exerciseSetCounter = new Map<number, number>();

  // Step 0: Get Ready
  steps.push({
    step: stepCount++,
    quantity: 10,
    name: t('convert_routine.get_ready'),
    information: `10 ${t('time.seconds')}`,
    automatic: true,
    isRest: true,
    weight: null,
  });

  let i = 0;
  while (i < routineData.exercises.length) {
    const item = routineData.exercises[i] as RoutineExerciseItem;

    // === MANUAL REST ===
    if (item.exerciseId == null) {
      const restSeconds = item.sets[0]?.quantity ?? 60;
      steps.push({
        step: stepCount++,
        quantity: restSeconds,
        name: t('convert_routine.rest'),
        information: `${restSeconds} ${t('time.seconds')}`,
        automatic: true,
        isRest: true,
        weight: null,
      });
      i++;
      continue;
    }

    // === REAL EXERCISE ===
    const exerciseId = item.exerciseId!;
    const exerciseName = item.name;
    const isTimeBased = item.exerciseType?.name === 'Time';

    // Get current global set count for this exercise
    const previousSets = exerciseSetCounter.get(exerciseId) || 0;

    // Collect all consecutive sets of this exercise (skip rests in between)
    const consecutiveSets: typeof item.sets = [];
    let j = i;
    while (j < routineData.exercises.length) {
      const nextItem = routineData.exercises[j] as RoutineExerciseItem;
      if (nextItem.exerciseId === exerciseId) {
        consecutiveSets.push(...nextItem.sets);
        j++;
      } else {
        break; // stop at rest or different exercise
      }
    }

    // Process each set in this consecutive block
    consecutiveSets.forEach((set, localIndex) => {
      const globalSetNumber = previousSets + localIndex + 1;

      let info = isTimeBased
        ? `${set.quantity} ${t('time.seconds')}`
        : `${set.quantity} ${t('convert_routine.reps')}`;
      if (set.weight > 0) info += `, ${set.weight} kg`;

      steps.push({
        step: stepCount++,
        quantity: set.quantity,
        name: `${exerciseName} - ${t('convert_routine.set')} ${globalSetNumber}`,
        information: info,
        automatic: isTimeBased,
        isRest: false,
        weight: set.weight,
      });

      // === REST AFTER SET (only if not last in block) ===
      if (localIndex < consecutiveSets.length - 1) {
        const restIndex = i + localIndex + 1;
        const restItem = routineData.exercises[restIndex] as RoutineExerciseItem | undefined;

        if (restItem && restItem?.exerciseId == null) {
          const restSeconds = restItem.sets[0]?.quantity ?? 60;
          steps.push({
            step: stepCount++,
            quantity: restSeconds,
            name: t('convert_routine.rest'),
            information: `${restSeconds} ${t('time.seconds')}`,
            automatic: true,
            isRest: true,
            weight: null,
          });
        } else if (isAutomatic && setRestTimer?.restTime != null && setRestTimer.restTime > 0) {
          steps.push({
            step: stepCount++,
            quantity: setRestTimer.restTime,
            name: t('convert_routine.rest_after_set'),
            information: `${setRestTimer.restTime} ${t('time.seconds')}`,
            automatic: true,
            isRest: true,
            weight: null,
          });
        }
      }
    });

    // Update global counter for this exercise
    exerciseSetCounter.set(exerciseId, previousSets + consecutiveSets.length);

    // === REST AFTER FULL BLOCK (automatic mode only) ===
    if (
      isAutomatic &&
      exerciseRestTimer?.restTime != null &&
      exerciseRestTimer.restTime > 0 &&
      j < routineData.exercises.length
    ) {
      const nextAfterBlock = routineData.exercises[j] as RoutineExerciseItem | undefined;
      if (!nextAfterBlock || nextAfterBlock.exerciseId != null) {
        steps.push({
          step: stepCount++,
          quantity: exerciseRestTimer.restTime,
          name: `${t('convert_routine.rest_after')} ${exerciseName}`,
          information: `${exerciseRestTimer.restTime} ${t('time.seconds')}`,
          automatic: true,
          isRest: true,
          weight: null,
        });
      }
    }

    // Move pointer past this exercise block
    i = j;
  }

  return steps;
};
