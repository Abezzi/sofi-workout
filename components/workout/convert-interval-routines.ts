import { Step } from '@/types/workout';
import { TFunction } from 'i18next';
export interface Hiit {
  rounds: number;
  workTime: number;
  restTime: number;
  cycles: number;
  cycleRestTime: number;
}

export interface Emom {
  rounds: number;
  workTime: number;
  cycles: number;
  cycleRestTime: number;
}

export interface Tabata {
  rounds: number;
  workTime: number;
  restTime: number;
  cycles: number;
  cycleRestTime: number;
}

export interface Amrap {
  workTime: number;
}

export const convertHiitToSteps = (hiit: Hiit, t: TFunction): Step[] => {
  let stepsTemp: Step[] = [];
  let stepCount: number = 0;

  // preparation before starting
  stepsTemp.push({
    step: stepCount,
    name: t('convert_routine.get_ready'),
    information: null,
    automatic: true,
    isRest: true,
    quantity: 10,
    weight: null,
  });
  stepCount++;
  for (let cycle = 0; cycle < hiit.cycles; cycle++) {
    for (let round = 0; round < hiit.rounds; round++) {
      stepsTemp.push({
        step: stepCount,
        quantity: hiit.workTime,
        name:
          hiit.cycles > 1
            ? `${t('convert_routine.work')} ${round + 1} ${t('convert_routine.of')} ${hiit.rounds} :: ${t('convert_routine.cycle')}: ${cycle + 1}/${hiit.cycles}`
            : `${t('convert_routine.work')} ${round + 1} ${t('convert_routine.of')} ${hiit.rounds}`,
        information: null,
        automatic: true,
        isRest: false,
        weight: null,
      });
      stepCount++;
      stepsTemp.push({
        step: stepCount,
        quantity: hiit.restTime,
        name: t('convert_routine.rest'),
        information: null,
        automatic: true,
        isRest: true,
        weight: null,
      });
      stepCount++;
    }
    if (cycle < hiit.cycles - 1) {
      stepsTemp.push({
        step: stepCount,
        quantity: hiit.cycleRestTime,
        name: t('convert_routine.cycle_rest'),
        information: null,
        automatic: true,
        isRest: true,
        weight: null,
      });
      stepCount++;
    }
  }
  return stepsTemp;
};

export const convertEmomToSteps = (emom: Emom, t: TFunction): Step[] => {
  let stepsTemp: Step[] = [];
  let stepCount: number = 0;

  // preparation before starting
  stepsTemp.push({
    step: stepCount,
    quantity: 10,
    name: t('convert_routine.get_ready'),
    information: null,
    automatic: true,
    isRest: true,
    weight: null,
  });
  stepCount++;
  for (let cycle = 0; cycle < emom.cycles; cycle++) {
    for (let round = 0; round < emom.rounds; round++) {
      stepsTemp.push({
        step: stepCount,
        quantity: emom.workTime,
        name:
          emom.cycles > 1
            ? `${t('convert_routine.work')} ${round + 1} ${t('convert_routine.of')} ${emom.rounds} :: ${t('convert_routine.cycle')}: ${cycle + 1}/${emom.cycles}`
            : `${t('convert_routine.work')} ${round + 1} ${t('convert_routine.of')} ${emom.rounds}`,
        information: null,
        automatic: true,
        isRest: false,
        weight: null,
      });
      stepCount++;
    }
    if (cycle < emom.cycles - 1) {
      stepsTemp.push({
        step: stepCount,
        quantity: emom.cycleRestTime,
        name: t('convert_routine.cycle_rest'),
        information: null,
        automatic: true,
        isRest: true,
        weight: null,
      });
      stepCount++;
    }
  }
  return stepsTemp;
};

export const convertTabataToSteps = (tabata: Tabata, t: TFunction): Step[] => {
  let stepsTemp: Step[] = [];
  let stepCount: number = 0;

  // preparation before starting
  stepsTemp.push({
    step: stepCount,
    quantity: 10,
    name: t('convert_routine.get_ready'),
    information: null,
    automatic: true,
    isRest: true,
    weight: null,
  });
  stepCount++;
  for (let cycle = 0; cycle < tabata.cycles; cycle++) {
    for (let round = 0; round < tabata.rounds; round++) {
      stepsTemp.push({
        step: stepCount,
        quantity: tabata.workTime,
        name:
          tabata.cycles > 1
            ? `${t('convert_routine.work')} ${round + 1} ${t('convert_routine.of')} ${tabata.rounds} :: ${t('convert_routine.cycle')}: ${cycle + 1}/${tabata.cycles}`
            : `${t('convert_routine.work')} ${round + 1} ${t('convert_routine.of')} ${tabata.rounds}`,
        information: null,
        automatic: true,
        isRest: false,
        weight: null,
      });
      stepCount++;
      stepsTemp.push({
        step: stepCount,
        quantity: tabata.restTime,
        name: t('convert_routine.rest'),
        information: null,
        automatic: true,
        isRest: true,
        weight: null,
      });
      stepCount++;
    }
    if (cycle < tabata.cycles - 1) {
      stepsTemp.push({
        step: stepCount,
        quantity: tabata.cycleRestTime,
        name: t('convert_routine.cycle_rest'),
        information: null,
        automatic: true,
        isRest: true,
        weight: null,
      });
      stepCount++;
    }
  }
  return stepsTemp;
};

export const convertAmrapToSteps = (amrap: Amrap, t: TFunction): Step[] => {
  let stepsTemp: Step[] = [];
  let stepCount: number = 0;

  // preparation before starting
  stepsTemp.push({
    step: stepCount,
    quantity: 10,
    name: t('convert_routine.get_ready'),
    information: null,
    automatic: true,
    isRest: true,
    weight: null,
  });
  stepCount++;
  stepsTemp.push({
    step: stepCount,
    quantity: amrap.workTime,
    name: t('convert_routine.work'),
    information: null,
    automatic: true,
    isRest: false,
    weight: null,
  });
  return stepsTemp;
};
