import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Step } from '@/types/workout';

export type TimerState = {
  steps: Step[];
  currentTimer: { index: number; timeLeft: number };
  progress: number;
  isPaused: boolean;
  isLoading: boolean;
  currentStep: number;
};

const initialState: TimerState = {
  steps: [],
  currentTimer: { index: 0, timeLeft: 0 },
  progress: 0,
  isPaused: true,
  isLoading: true,
  currentStep: 0,
};

const timerSlice = createSlice({
  name: 'timer',
  initialState,
  reducers: {
    initialize: (state, action: PayloadAction<{ steps: Step[] }>) => {
      const steps = action.payload.steps;
      if (steps.length > 0) {
        state.steps = steps;
        state.currentTimer = { index: 0, timeLeft: steps[0].quantity };
        state.progress = 0;
        state.isLoading = false;
        state.isPaused = true;
        state.currentStep = 0;
      } else {
        state.isLoading = true;
      }
    },
    tick: (state) => {
      if (state.isLoading || !state.steps.length || state.isPaused) {
        return;
      }
      if (state.currentTimer.index >= state.steps.length) {
        state.progress = 0;
        state.currentStep = state.currentTimer.index;
        return;
      }
      const currentStep = state.steps[state.currentTimer.index];
      if (!currentStep.automatic) {
        return;
      }
      const newTimeLeft = state.currentTimer.timeLeft - 1;
      if (newTimeLeft > 0) {
        const percentOfTimeRemaining = (newTimeLeft / currentStep.quantity) * 100;
        state.currentTimer.timeLeft = newTimeLeft;
        state.progress = percentOfTimeRemaining;
      } else {
        const nextIndex = state.currentTimer.index + 1;
        if (nextIndex < state.steps.length) {
          state.currentTimer = { index: nextIndex, timeLeft: state.steps[nextIndex].quantity };
          state.progress = 100;
          state.currentStep = nextIndex;
        } else {
          state.currentTimer.timeLeft = 0;
          state.progress = 0;
          state.currentStep = nextIndex;
          state.isPaused = true;
        }
      }
    },
    startPause: (state, action: PayloadAction<{ isPaused: boolean }>) => {
      state.isPaused = action.payload.isPaused;
    },
    stop: (state) => {
      state.currentTimer = { index: 0, timeLeft: state.steps[0]?.quantity || 0 };
      state.progress = 0;
      state.currentStep = 0;
      state.isPaused = true;
    },
    nextStep: (state) => {
      const nextIndex = state.currentTimer.index + 1;
      if (nextIndex < state.steps.length) {
        state.currentTimer = { index: nextIndex, timeLeft: state.steps[nextIndex].quantity };
        state.progress = 100;
        state.currentStep = nextIndex;
        state.isPaused = true;
      }
    },
    previousStep: (state) => {
      const prevIndex = state.currentTimer.index - 1;
      if (prevIndex >= 0) {
        state.currentTimer = { index: prevIndex, timeLeft: state.steps[prevIndex].quantity };
        state.progress = 100;
        state.currentStep = prevIndex;
        state.isPaused = true;
      }
    },
    nextStepAndStart: (state) => {
      const nextIndex = state.currentTimer.index + 1;
      if (nextIndex < state.steps.length) {
        state.currentTimer = { index: nextIndex, timeLeft: state.steps[nextIndex].quantity };
        state.progress = 100;
        state.currentStep = nextIndex;
        state.isPaused = false;
      }
    },
  },
});

export const { initialize, tick, startPause, stop, nextStep, previousStep, nextStepAndStart } =
  timerSlice.actions;
export default timerSlice.reducer;
