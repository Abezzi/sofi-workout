import { relations } from 'drizzle-orm';

import { exercise } from './exercise';
import { exercise_type } from './exercise_type';
import { category } from './category';
import { routine } from './routine';
import { routine_exercise } from './routine_exercise';
import { exercise_set } from './exercise_set';
import { rest_timer } from './rest_timer';
import { workout } from './workout';
import { workout_set } from './workout_set';
import { workout_rest_timer } from './workout_rest_timer';
import { workout_exercise } from './workout_exercise';

export * from './category';
export * from './exercise_type';
export * from './exercise';
export * from './routine';
export * from './routine_exercise';
export * from './exercise_set';
export * from './rest_timer';
export * from './workout';
export * from './workout_exercise';
export * from './workout_set';
export * from './workout_rest_timer';

export const exerciseRelations = relations(exercise, ({ one }) => ({
  category: one(category, {
    fields: [exercise.categoryId],
    references: [category.id],
  }),
  exercise_type: one(exercise_type, {
    fields: [exercise.exerciseTypeId],
    references: [exercise_type.id],
  }),
}));

export const routineExerciseRelations = relations(routine_exercise, ({ one }) => ({
  routine: one(routine, {
    fields: [routine_exercise.routineId],
    references: [routine.id],
  }),
  exercise: one(exercise, {
    fields: [routine_exercise.exerciseId],
    references: [exercise.id],
  }),
}));

export const exerciseSetRelations = relations(exercise_set, ({ one }) => ({
  routine: one(routine_exercise, {
    fields: [exercise_set.routineExerciseId],
    references: [routine_exercise.id],
  }),
}));

export const restTimerRelations = relations(rest_timer, ({ one }) => ({
  routine: one(routine, {
    fields: [rest_timer.routineId],
    references: [routine.id],
  }),
  routine_exercise: one(routine_exercise, {
    fields: [rest_timer.routineExerciseId],
    references: [routine_exercise.id],
  }),
  exercise_set: one(exercise_set, {
    fields: [rest_timer.exerciseSetId],
    references: [exercise_set.id],
  }),
}));

export const workoutRelations = relations(workout, ({ many, one }) => ({
  routine: one(routine, {
    fields: [workout.routineId],
    references: [routine.id],
  }),
  exercises: many(workout_exercise),
  restTimers: many(workout_rest_timer),
}));

export const workoutExerciseRelations = relations(workout_exercise, ({ one, many }) => ({
  workout: one(workout, {
    fields: [workout_exercise.workoutId],
    references: [workout.id],
  }),
  exercise: one(exercise, {
    fields: [workout_exercise.exerciseId],
    references: [exercise.id],
  }),
  sets: many(workout_set),
  restTimers: many(workout_rest_timer),
}));

export const workoutSetRelations = relations(workout_set, ({ one, many }) => ({
  workoutExercise: one(workout_exercise, {
    fields: [workout_set.workoutExerciseId],
    references: [workout_exercise.id],
  }),
  restTimers: many(workout_rest_timer),
}));

export const workoutRestTimerRelations = relations(workout_rest_timer, ({ one }) => ({
  workout: one(workout, {
    fields: [workout_rest_timer.workoutId],
    references: [workout.id],
  }),
  workoutExercise: one(workout_exercise, {
    fields: [workout_rest_timer.workoutExerciseId],
    references: [workout_exercise.id],
  }),
  workoutSet: one(workout_set, {
    fields: [workout_rest_timer.workoutSetId],
    references: [workout_set.id],
  }),
}));
