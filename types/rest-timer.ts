// this can only be assign to 'set' or 'exercise'
export const restTimerTypes = ['set', 'exercise'] as const;
export type RestTimerType = (typeof restTimerTypes)[number];
