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

export type Step = {
  step: number;
  duration: number;
  name: string;
  automatic: boolean;
  isRest: boolean;
};

export const convertHiitToSteps = (hiit: Hiit): Step[] => {
  let stepsTemp: Step[] = [];
  let stepCount: number = 0;

  // preparation before starting
  stepsTemp.push({
    step: stepCount,
    duration: 10,
    name: 'Get Ready',
    automatic: true,
    isRest: true,
  });
  stepCount++;
  for (let cycle = 0; cycle < hiit.cycles; cycle++) {
    for (let round = 0; round < hiit.rounds; round++) {
      stepsTemp.push({
        step: stepCount,
        duration: hiit.workTime,
        name: 'Work',
        automatic: true,
        isRest: false,
      });
      stepCount++;
      stepsTemp.push({
        step: stepCount,
        duration: hiit.restTime,
        name: 'Rest',
        automatic: true,
        isRest: true,
      });
      stepCount++;
    }
    if (cycle < hiit.cycles - 1) {
      stepsTemp.push({
        step: stepCount,
        duration: hiit.cycleRestTime,
        name: 'Cycle Rest',
        automatic: true,
        isRest: true,
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
    duration: 10,
    name: 'Get Ready',
    automatic: true,
    isRest: true,
  });
  stepCount++;
  for (let cycle = 0; cycle < emom.cycles; cycle++) {
    for (let round = 0; round < emom.rounds; round++) {
      stepsTemp.push({
        step: stepCount,
        duration: emom.workTime,
        name: 'Work',
        automatic: true,
        isRest: false,
      });
      stepCount++;
    }
    if (cycle < emom.cycles - 1) {
      stepsTemp.push({
        step: stepCount,
        duration: emom.cycleRestTime,
        name: 'Cycle Rest',
        automatic: true,
        isRest: true,
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
    duration: 10,
    name: 'Get Ready',
    automatic: true,
    isRest: true,
  });
  stepCount++;
  for (let cycle = 0; cycle < tabata.cycles; cycle++) {
    for (let round = 0; round < tabata.rounds; round++) {
      stepsTemp.push({
        step: stepCount,
        duration: tabata.workTime,
        name: 'Work',
        automatic: true,
        isRest: false,
      });
      stepCount++;
      stepsTemp.push({
        step: stepCount,
        duration: tabata.restTime,
        name: 'Rest',
        automatic: true,
        isRest: true,
      });
      stepCount++;
    }
    if (cycle < tabata.cycles - 1) {
      stepsTemp.push({
        step: stepCount,
        duration: tabata.cycleRestTime,
        name: 'Cycle Rest',
        automatic: true,
        isRest: true,
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
    duration: 10,
    name: 'Get Ready',
    automatic: true,
    isRest: true,
  });
  stepCount++;
  stepsTemp.push({
    step: stepCount,
    duration: amrap.workTime,
    name: 'Work',
    automatic: true,
    isRest: false,
  });
  return stepsTemp;
};
