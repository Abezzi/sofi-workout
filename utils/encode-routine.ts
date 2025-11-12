import { RoutineWithExerciseAndRest } from '@/db/queries/routine.queries';

export const encodeRoutine = (routine: RoutineWithExerciseAndRest): string => {
  const header = `!SW!`;
  const bodyParts: string[] = [];

  // routine name
  bodyParts.push(encodeURIComponent(routine.name));

  // exercises
  // routine.exercises.forEach((ex) => {
  //   bodyParts.push(`${ex.name}|${ex.sets}|${ex.reps}`);
  // });

  // return `${header}(${bodyParts.join(""))}${randomPadding})`;
  return `${header}${bodyParts.join('')}`;
};
