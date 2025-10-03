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
  const { hiitJson, totalTime } = useLocalSearchParams() as {
    hiitJson: string;
    totalTime: string;
  };
  const [hiit, setHiit] = useState<Hiit | null>(null);

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
      console.log('generated steps: ', stepsTemp);
      setSteps(stepsTemp);
    }
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  // load parameters
  useEffect(() => {
    console.log('received params:', { hiitJson, totalTime });
    if (hiitJson) {
      try {
        const parsedHiit = JSON.parse(hiitJson as string);
        console.log('parsed hiit: ', parsedHiit);
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

  useEffect(() => {
    console.log('steps updated: ', steps);
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
      <Text>{hiitJson}</Text>
      <Text>{steps.map((x) => x.duration + ' ')}</Text>
      <Text>current step: {currentStep}</Text>
    </>
  );
}
