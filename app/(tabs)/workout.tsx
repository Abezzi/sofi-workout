import { Text } from '@/components/ui/text';
import Countdown from '@/components/workout/countdown';
import MediaControl from '@/components/workout/media-control';
import Routine from '@/components/workout/routine';
import TotalProgress from '@/components/workout/total-progress';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

interface Hiit {
  rounds: number;
  workTime: number;
  restTime: number;
  cycles: number;
  cycleRestTime: number;
}

interface Emom {
  rounds: number;
  workTime: number;
  cycles: number;
  cycleRestTime: number;
}

interface Tabata {
  rounds: number;
  workTime: number;
  restTime: number;
  cycles: number;
  cycleRestTime: number;
}

interface Amrap {
  workTime: number;
}

type Step = {
  step: number;
  duration: number;
  name: string;
  // if its of type do something x amount of time => 'true' : 'false'
  automatic: boolean;
  isRest: boolean;
};

export default function WorkoutScreen() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [hiit, setHiit] = useState<Hiit | null>(null);
  const { hiitJson, totalTime } = useLocalSearchParams() as {
    hiitJson: string;
    totalTime: string;
  };
  const [emom, setEmom] = useState<Emom | null>(null);
  const { emomJson } = useLocalSearchParams() as {
    emomJson: string;
  };
  const [tabata, setTabata] = useState<Tabata | null>(null);
  const { tabataJson } = useLocalSearchParams() as {
    tabataJson: string;
  };
  const [amrap, setAmrap] = useState<Amrap | null>(null);
  const { amrapJson } = useLocalSearchParams() as {
    amrapJson: string;
  };

  const convertHiitToSteps = () => {
    let stepsTemp: Step[] = [];
    let stepCount: number = 0;

    if (hiit) {
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
      setSteps(stepsTemp);
    }
  };

  const convertEmomToSteps = () => {
    let stepsTemp: Step[] = [];
    let stepCount: number = 0;

    if (emom) {
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
      setSteps(stepsTemp);
    }
  };

  const convertTabataToSteps = () => {
    let stepsTemp: Step[] = [];
    let stepCount: number = 0;

    if (tabata) {
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
      setSteps(stepsTemp);
    }
  };

  const convertAmrapToSteps = () => {
    let stepsTemp: Step[] = [];
    let stepCount: number = 0;

    if (amrap) {
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
      setSteps(stepsTemp);
    }
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  // HIIT
  // load parameters
  useEffect(() => {
    if (hiitJson) {
      try {
        const parsedHiit = JSON.parse(hiitJson as string);
        setHiit(parsedHiit);
      } catch (error) {
        console.log('error parsing the params of hiit: ', error);
      }
    }
  }, [hiitJson]);

  useEffect(() => {
    if (hiit) {
      convertHiitToSteps();
    }
  }, [hiit]);

  // EMOM
  useEffect(() => {
    if (emomJson) {
      try {
        const parsedEmom = JSON.parse(emomJson as string);
        setEmom(parsedEmom);
      } catch (error) {
        console.log('error parsing the params of emom: ', error);
      }
    }
  }, [emomJson]);

  useEffect(() => {
    if (emom) {
      convertEmomToSteps();
    }
  }, [emom]);

  // TABATA
  useEffect(() => {
    if (tabataJson) {
      try {
        const parsedTabata = JSON.parse(tabataJson as string);
        setTabata(parsedTabata);
      } catch (error) {
        console.log('error parsing the params of tabata: ', error);
      }
    }
  }, [tabataJson]);

  useEffect(() => {
    if (tabata) {
      convertTabataToSteps();
    }
  }, [tabata]);

  // AMRAP
  useEffect(() => {
    if (amrapJson) {
      try {
        const parsedAmrap = JSON.parse(amrapJson as string);
        setAmrap(parsedAmrap);
      } catch (error) {
        console.log('error parsing the params of amrap: ', error);
      }
    }
  }, [amrapJson]);

  useEffect(() => {
    if (amrap) {
      convertAmrapToSteps();
    }
  }, [amrap]);

  useEffect(() => {
    if (steps.length) {
      setCurrentStep(0);
    }
  }, [steps]);

  return (
    <>
      <TotalProgress steps={steps} currentStep={currentStep} />
      <Countdown steps={steps} onStepChange={handleStepChange} />
      <MediaControl />
      <Routine />
    </>
  );
}
