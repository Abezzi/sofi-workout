import Countdown from '@/components/workout/countdown';
import MediaControl from '@/components/workout/media-control';
import Routine from '@/components/workout/routine';
import TotalProgress from '@/components/workout/total-progress';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useAudioPlayer } from 'expo-audio';

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
  const [currentTimer, setCurrentTimer] = useState({ index: 0, timeLeft: 0 });
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hiit, setHiit] = useState<Hiit | null>(null);
  const { hiitJson } = useLocalSearchParams() as {
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

  let player = useAudioPlayer(require('../../assets/audio/alert.mp3'));
  let player5 = useAudioPlayer(require('../../assets/audio/countdown/esMX/male/5.mp3'));
  let player4 = useAudioPlayer(require('../../assets/audio/countdown/esMX/male/4.mp3'));
  let player3 = useAudioPlayer(require('../../assets/audio/countdown/esMX/male/3.mp3'));
  let player2 = useAudioPlayer(require('../../assets/audio/countdown/esMX/male/2.mp3'));
  let player1 = useAudioPlayer(require('../../assets/audio/countdown/esMX/male/1.mp3'));
  let infoSound = useAudioPlayer(require('../../assets/audio/info.mp3'));

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

  // media control handlers
  const handleStartPause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsPaused(true);
    setCurrentTimer({ index: 0, timeLeft: steps[0]?.duration || 0 });
    setProgress(0);
    setCurrentStep(0);
  };

  const handleRewind = () => {
    const prevIndex = currentTimer.index - 1;
    if (prevIndex >= 0) {
      setCurrentTimer({ index: prevIndex, timeLeft: steps[prevIndex].duration });
      setProgress(100);
      setCurrentStep(prevIndex);
      setIsPaused(true);
    }
  };

  const handleFastForward = () => {
    const nextIndex = currentTimer.index + 1;
    if (nextIndex < steps.length) {
      setCurrentTimer({ index: nextIndex, timeLeft: steps[nextIndex].duration });
      setProgress(100);
      setCurrentStep(nextIndex);
      setIsPaused(true);
    }
  };

  // init currentTimer when steps change
  useEffect(() => {
    if (steps.length > 0) {
      setCurrentTimer({ index: 0, timeLeft: steps[0].duration });
      setProgress(0);
      setIsLoading(false);
      setIsPaused(true);
      setCurrentStep(0);
    } else {
      setIsLoading(true);
    }
  }, [steps]);

  // timer logic
  useEffect(() => {
    if (isLoading || !steps.length || isPaused) return;

    const interval = setInterval(() => {
      setCurrentTimer((prev) => {
        if (prev.index >= steps.length) {
          clearInterval(interval);
          return prev;
        }

        const currentStep = steps[prev.index];
        if (!currentStep.automatic) {
          return prev; // Skip non-automatic steps
        }

        const newTimeLeft = prev.timeLeft - 1;
        if (newTimeLeft > 0) {
          const percentOfTimeRemaining = (newTimeLeft / currentStep.duration) * 100;
          setProgress(percentOfTimeRemaining);

          // Audio playback
          if (newTimeLeft === 30 && currentStep.duration >= 30) {
            player.seekTo(0);
            player.play();
          } else if (newTimeLeft === 5) {
            player5.seekTo(0);
            player5.play();
          } else if (newTimeLeft === 4) {
            player4.seekTo(0);
            player4.play();
          } else if (newTimeLeft === 3) {
            player3.seekTo(0);
            player3.play();
          } else if (newTimeLeft === 2) {
            player2.seekTo(0);
            player2.play();
          } else if (newTimeLeft === 1) {
            player1.seekTo(0);
            player1.play();
          }

          return { ...prev, timeLeft: newTimeLeft };
        } else {
          // Step complete
          infoSound.seekTo(0);
          infoSound.play();

          const nextIndex = prev.index + 1;
          if (nextIndex < steps.length) {
            setProgress(100);
            setCurrentStep(nextIndex);
            return { index: nextIndex, timeLeft: steps[nextIndex].duration };
          } else {
            clearInterval(interval);
            setProgress(0);
            setCurrentStep(nextIndex);
            return { index: nextIndex, timeLeft: 0 };
          }
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading, steps, isPaused]);

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

  // keep awake when screen loaded, deactivate it when leaving
  useFocusEffect(
    useCallback(() => {
      activateKeepAwakeAsync();
      return () => {
        deactivateKeepAwake();
      };
    }, [])
  );

  return (
    <>
      <TotalProgress steps={steps} currentStep={currentStep} />
      <Countdown
        steps={steps}
        currentTimer={currentTimer}
        progress={progress}
        isLoading={isLoading}
        isPaused={isPaused}
      />
      <MediaControl
        onStartPause={handleStartPause}
        onStop={handleStop}
        onRewind={handleRewind}
        onFastForward={handleFastForward}
        isPaused={isPaused}
      />
      <Routine />
    </>
  );
}
