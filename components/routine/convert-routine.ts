import { getRoutineWithExerciseAndRest } from '@/db/queries/routine.queries';
import { Step } from '@/types/workout';
import { TFunction } from 'i18next';

export const convertRoutineToSteps = async (
  selectedRoutineId: number,
  t: TFunction
): Promise<Step[]> => {
  let stepsTemp: Step[] = [];
  let stepCount: number = 0;

  // get the routine with exercises and rest based on the routine id
  const routineData = await getRoutineWithExerciseAndRest(selectedRoutineId);

  if (routineData) {
    // get ready step 0
    stepsTemp.push({
      step: stepCount,
      quantity: 10,
      name: t('convert_routine.get_ready'),
      automatic: true,
      isRest: true,
      weight: null,
    });
    stepCount++;

    const isAutomatic = routineData.restMode === 'automatic';
    // find rest timers for sets and exercises
    const setRestTimer = routineData.restTimers.find((rt) => rt.type === 'set');
    const exerciseRestTimer = routineData.restTimers.find((rt) => rt.type === 'exercise');

    // iterate through exercises
    for (let i = 0; i < routineData.exercises.length; i++) {
      const exercise = routineData.exercises[i];
      // console.log(`Exercise ${exercise.name} sets:`, exercise.sets);
      const isExerciseAutomatic = exercise.exerciseType?.name === 'Time';

      // process each set
      for (let j = 0; j < exercise.sets.length; j++) {
        const set = exercise.sets[j];
        let quantity = `${set.quantity} ${exercise.exerciseType?.name === 'Reps' ? t('convert_routine.reps') : t('time.seconds')}`;
        let weight = `${set.weight > 0 ? ', ' + set.weight + ' kg' : ''}`;
        let quantityAndWeightTag = `(${quantity}${weight})`;

        // add step for the set
        stepsTemp.push({
          step: stepCount,
          quantity: set.quantity,
          name: `${exercise.name} - ${t('convert_routine.set')} ${set.setNumber} ${quantityAndWeightTag}`,
          automatic: isExerciseAutomatic,
          isRest: false,
          weight: set.weight,
        });
        stepCount++;

        // add rest step after set (except for the last set of the last exercise)
        if (
          isAutomatic &&
          setRestTimer &&
          j < exercise.sets.length - 1 &&
          setRestTimer.restTime > 0
        ) {
          stepsTemp.push({
            step: stepCount,
            quantity: setRestTimer.restTime,
            name: `${t('convert_routine.rest_after')} ${exercise.name} - ${t('convert_routine.set')} ${set.setNumber}`,
            automatic: true,
            isRest: true,
            weight: null,
          });
          stepCount++;
        }
      }

      // add rest step after exercise (except for the last exercise)
      if (
        isAutomatic &&
        exerciseRestTimer &&
        i < routineData.exercises.length - 1 &&
        exerciseRestTimer.restTime > 0
      ) {
        stepsTemp.push({
          step: stepCount,
          quantity: exerciseRestTimer.restTime,
          name: `${t('convert_routine.rest_after')} ${exercise.name}`,
          automatic: true,
          isRest: true,
          weight: null,
        });
        stepCount++;
      }
    }

    return stepsTemp;
  } else {
    return stepsTemp;
  }
};
