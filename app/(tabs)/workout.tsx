import Countdown from '@/components/workout/countdown';
import MediaControl from '@/components/workout/media-control';
import RoutineDisplay from '@/components/workout/routine-display';
import TotalProgress from '@/components/workout/total-progress';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useAudioPlayer } from 'expo-audio';
import { useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/src/store/storeSetup';
import {
  initialize,
  tick,
  startPause,
  stop,
  nextStep,
  previousStep,
} from '@/src/store/slices/workout/timerSlice';
import { useSelector } from 'react-redux';
import { View } from 'react-native';

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
  const dispatch = useDispatch<AppDispatch>();
  const { steps, currentTimer, progress, isPaused, isLoading, currentStep } = useSelector(
    (state: RootState) => state.timer
  );
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
      dispatch(initialize({ steps: stepsTemp }));
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
      dispatch(initialize({ steps: stepsTemp }));
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
      dispatch(initialize({ steps: stepsTemp }));
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
      dispatch(initialize({ steps: stepsTemp }));
    }
  };

  // media control handlers
  const handleStartPause = () => {
    dispatch(startPause({ isPaused: !isPaused }));
  };

  const handleStop = () => {
    dispatch(stop());
  };

  const handleRewind = () => {
    dispatch(previousStep());
  };

  const handleFastForward = () => {
    dispatch(nextStep());
  };

  // timer logic with audio
  useEffect(() => {
    if (isLoading || !steps.length || isPaused) return;

    const interval = setInterval(() => {
      const currentTimeLeft = currentTimer.timeLeft;
      const currentStepObj = steps[currentTimer.index];

      if (currentTimeLeft === 31 && currentStepObj?.duration >= 30) {
        player.seekTo(0);
        player.play();
      } else if (currentTimeLeft === 6) {
        player5.seekTo(0);
        player5.play();
      } else if (currentTimeLeft === 5) {
        player4.seekTo(0);
        player4.play();
      } else if (currentTimeLeft === 4) {
        player3.seekTo(0);
        player3.play();
      } else if (currentTimeLeft === 3) {
        player2.seekTo(0);
        player2.play();
      } else if (currentTimeLeft === 2) {
        player1.seekTo(0);
        player1.play();
      } else if (currentTimeLeft === 1 && currentTimer.index < steps.length) {
        infoSound.seekTo(0);
        infoSound.play();
      }

      dispatch(tick());
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading, steps, isPaused, currentTimer, dispatch]);

  // HIIT
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
    <View className="items-center">
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
      <RoutineDisplay />
    </View>
  );
}
