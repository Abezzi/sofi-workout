import { Step } from '@/types/workout';
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

export const convertHiitToSteps = (hiit: Hiit): Step[] => {
  let stepsTemp: Step[] = [];
  let stepCount: number = 0;

  // preparation before starting
  stepsTemp.push({
    step: stepCount,
    name: 'Get Ready',
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
            ? `Work ${round + 1} of ${hiit.rounds} :: Cycle: ${cycle + 1}/${hiit.cycles}`
            : `Work ${round + 1} of ${hiit.rounds}`,
        automatic: true,
        isRest: false,
        weight: null,
      });
      stepCount++;
      stepsTemp.push({
        step: stepCount,
        quantity: hiit.restTime,
        name: 'Rest',
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
        name: 'Cycle Rest',
        automatic: true,
        isRest: true,
        weight: null,
      });
      stepCount++;
    }
  }
  return stepsTemp;
};

export const convertEmomToSteps = (emom: Emom): Step[] => {
  let stepsTemp: Step[] = [];
  let stepCount: number = 0;

  // preparation before starting
  stepsTemp.push({
    step: stepCount,
    quantity: 10,
    name: 'Get Ready',
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
            ? `Work ${round + 1} of ${emom.rounds} :: Cycle: ${cycle + 1}/${emom.cycles}`
            : `Work ${round + 1} of ${emom.rounds}`,
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
        name: 'Cycle Rest',
        automatic: true,
        isRest: true,
        weight: null,
      });
      stepCount++;
    }
  }
  return stepsTemp;
};

export const convertTabataToSteps = (tabata: Tabata): Step[] => {
  let stepsTemp: Step[] = [];
  let stepCount: number = 0;

  // preparation before starting
  stepsTemp.push({
    step: stepCount,
    quantity: 10,
    name: 'Get Ready',
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
            ? `Work ${round + 1} of ${tabata.rounds} :: Cycle: ${cycle + 1}/${tabata.cycles}`
            : `Work ${round + 1} of ${tabata.rounds}`,
        automatic: true,
        isRest: false,
        weight: null,
      });
      stepCount++;
      stepsTemp.push({
        step: stepCount,
        quantity: tabata.restTime,
        name: 'Rest',
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
        name: 'Cycle Rest',
        automatic: true,
        isRest: true,
        weight: null,
      });
      stepCount++;
    }
  }
  return stepsTemp;
};

export const convertAmrapToSteps = (amrap: Amrap): Step[] => {
  let stepsTemp: Step[] = [];
  let stepCount: number = 0;

  // preparation before starting
  stepsTemp.push({
    step: stepCount,
    quantity: 10,
    name: 'Get Ready',
    automatic: true,
    isRest: true,
    weight: null,
  });
  stepCount++;
  stepsTemp.push({
    step: stepCount,
    quantity: amrap.workTime,
    name: 'Work',
    automatic: true,
    isRest: false,
    weight: null,
  });
  return stepsTemp;
};
