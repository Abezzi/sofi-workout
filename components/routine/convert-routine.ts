import { getRoutineById, getRoutineWithExerciseAndRest } from '@/db/queries/routine.queries';

export type Step = {
  step: number;
  duration: number;
  name: string;
  automatic: boolean;
  isRest: boolean;
};

export const convertRoutineToSteps = async (selectedRoutineId: number): Promise<Step[]> => {
  let stepsTemp: Step[] = [];
  let stepCount: number = 0;

  // get the routine with exercises and rest based on the routine id
  const routineData = await getRoutineWithExerciseAndRest(selectedRoutineId);

  if (routineData) {
    // get ready step 0
    stepsTemp.push({
      step: stepCount,
      duration: 10,
      name: 'Get Ready',
      automatic: true,
      isRest: true,
    });
    stepCount++;

    const isAutomatic = routineData.restMode === 'automatic';
    // find rest timers for sets and exercises
    const setRestTimer = routineData.restTimers.find((rt) => rt.type === 'set');
    const exerciseRestTimer = routineData.restTimers.find((rt) => rt.type === 'exercise');

    // iterate through exercises
    for (let i = 0; i < routineData.exercises.length; i++) {
      const exercise = routineData.exercises[i];
      console.log(`Exercise ${exercise.name} sets:`, exercise.sets);
      const isExerciseAutomatic = exercise.exerciseType?.name === 'Time';

      // process each set
      for (let j = 0; j < exercise.sets.length; j++) {
        const set = exercise.sets[j];
        // add step for the set
        stepsTemp.push({
          step: stepCount,
          duration: 0, //TODO: implement duration for exercise_type == time exercises
          name: `${exercise.name} - Set ${set.setNumber} (${set.quantity} reps, ${set.weight} kg)`,
          automatic: isExerciseAutomatic,
          isRest: false,
        });
        stepCount++;

        // add rest step after set (except for the last set of the last exercise)
        if (isAutomatic && setRestTimer && j < exercise.sets.length - 1) {
          stepsTemp.push({
            step: stepCount,
            duration: setRestTimer.restTime,
            name: `Rest after ${exercise.name} - Set ${set.setNumber}`,
            automatic: true,
            isRest: true,
          });
          stepCount++;
        }
      }

      // add rest step after exercise (except for the last exercise)
      if (isAutomatic && exerciseRestTimer && i < routineData.exercises.length - 1) {
        stepsTemp.push({
          step: stepCount,
          duration: exerciseRestTimer.restTime,
          name: `Rest after ${exercise.name}`,
          automatic: true,
          isRest: true,
        });
        stepCount++;
      }
    }

    return stepsTemp;
  } else {
    return stepsTemp;
  }
};
