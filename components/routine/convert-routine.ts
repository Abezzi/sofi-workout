import { getRoutineWithExerciseAndRest } from '@/db/queries/routine.queries';
import { Step } from '@/types/workout';
import { TFunction } from 'i18next';

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

  // get ready step 0
  steps.push({
    step: stepCount++,
    quantity: 10,
    name: t('convert_routine.get_ready'),
    information: `10 ${t('time.seconds')}`,
    automatic: true,
    isRest: true,
    weight: null,
  });

  for (let i = 0; i < routineData.exercises.length; i++) {
    const item = routineData.exercises[i];

    // check if it's a manual rest
    const isRestItem = item.exerciseId === null || item.exerciseId === undefined;

    if (isRestItem) {
      const restSeconds = item.sets[0]?.quantity || 60;

      steps.push({
        step: stepCount++,
        quantity: restSeconds,
        name: t('convert_routine.rest'),
        information: `${restSeconds} ${t('time.seconds')}`,
        automatic: true,
        isRest: true,
        weight: null,
      });
      // skip exercise processing
      continue;
    }

    // real exercise (not rest)
    const exercise = item;
    const isTimeBased = exercise.exerciseType?.name === 'Time';

    for (let j = 0; j < exercise.sets.length; j++) {
      const set = exercise.sets[j];

      let info = '';
      if (!isTimeBased) {
        info = `${set.quantity} ${t('convert_routine.reps')}`;
      } else {
        info = `${set.quantity} ${t('time.seconds')}`;
      }

      if (set.weight > 0) {
        info += `${info ? ', ' : ''}${set.weight} kg`;
      }

      steps.push({
        step: stepCount++,
        quantity: set.quantity,
        name: `${exercise.name} - ${t('convert_routine.set')} ${set.setNumber}`,
        information: info,
        automatic: isTimeBased,
        isRest: false,
        weight: set.weight,
      });

      // rest after set (automatic mode only)
      if (
        isAutomatic &&
        setRestTimer &&
        j < exercise.sets.length - 1 &&
        setRestTimer.restTime > 0
      ) {
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

    // rest after exercise (automatic mode only)
    if (
      isAutomatic &&
      exerciseRestTimer &&
      i < routineData.exercises.length - 1 &&
      exerciseRestTimer.restTime > 0
    ) {
      steps.push({
        step: stepCount++,
        quantity: exerciseRestTimer.restTime,
        name: `${t('convert_routine.rest_after')} ${exercise.name}`,
        information: `${exerciseRestTimer.restTime} ${t('time.seconds')}`,
        automatic: true,
        isRest: true,
        weight: null,
      });
    }
  }

  return steps;
};
