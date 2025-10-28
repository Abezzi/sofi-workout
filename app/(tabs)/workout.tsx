import Countdown from '@/components/workout/countdown';
import MediaControl from '@/components/workout/media-control';
import RoutineDisplay from '@/components/workout/routine-display';
import TotalProgress from '@/components/workout/total-progress';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useAudioPlayer, AudioModule } from 'expo-audio';
import { useDispatch } from 'react-redux';
import store, { RootState, AppDispatch } from '@/src/store/storeSetup';
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
import {
  Hiit,
  Emom,
  Tabata,
  Amrap,
  convertHiitToSteps,
  convertEmomToSteps,
  convertTabataToSteps,
  convertAmrapToSteps,
} from '@/components/workout/convert-interval-routines';
import { convertRoutineToSteps } from '@/components/routine/convert-routine';
import * as Speech from 'expo-speech';

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
  const [currentSoundFile, setCurrentSoundFile] = useState<any>(null);
  const player = useAudioPlayer(currentSoundFile);
  const { selectedRoutine } = useLocalSearchParams() as {
    selectedRoutine: string;
  };
  const [speechLanguage, setSpeechLanguage] = useState<string>('');
  const currentLanguage = useSelector((state: RootState) => state.locale.currentLanguage);

  // sets and updates the speech language
  useEffect(() => {
    if (currentLanguage === 'en') {
      setSpeechLanguage('en-ENG');
    } else if (currentLanguage === 'es') {
      setSpeechLanguage('es-MX');
    }
  }, [currentLanguage]);

  // sets the audio options
  useEffect(() => {
    AudioModule.setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
      shouldPlayInBackground: true,
    });
  }, []);

  const playSound = async (file: any) => {
    try {
      if (currentSoundFile !== file) {
        // reload the player with the new file
        setCurrentSoundFile(file);
      } else {
        await player.seekTo(0);
        player.play();
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  // when the current sound changes seek to the start of the audio file and play it
  useEffect(() => {
    if (currentSoundFile) {
      player.seekTo(0);
      player.play();
    }
  }, [currentSoundFile, player]);

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
      const state = store.getState().timer;
      const currentTimeLeft = state.currentTimer.timeLeft;
      const currentStepObj = state.steps[currentTimer.index];

      if (currentTimeLeft === 31 && currentStepObj?.quantity >= 30) {
        playSound(require('../../assets/audio/alert.mp3'));
      } else if (currentTimeLeft === 6) {
        playSound(require('../../assets/audio/countdown/esMX/male/5.mp3'));
      } else if (currentTimeLeft === 5) {
        playSound(require('../../assets/audio/countdown/esMX/male/4.mp3'));
      } else if (currentTimeLeft === 4) {
        playSound(require('../../assets/audio/countdown/esMX/male/3.mp3'));
      } else if (currentTimeLeft === 3) {
        playSound(require('../../assets/audio/countdown/esMX/male/2.mp3'));
      } else if (currentTimeLeft === 2) {
        playSound(require('../../assets/audio/countdown/esMX/male/1.mp3'));
      } else if (currentTimeLeft === 1 && currentTimer.index < steps.length) {
        playSound(require('../../assets/audio/info.mp3'));
      }

      dispatch(tick());
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading, steps, isPaused, currentTimer, dispatch]);

  // text to speech the name of the exercise when the step changes
  useEffect(() => {
    const state = store.getState().timer;
    const currentStepObj = state.steps[currentStep];

    const tellWhichStepIsNext = (stepName: string) => {
      const speech = stepName;
      Speech.speak(speech, { language: speechLanguage });
    };

    tellWhichStepIsNext(currentStepObj.name);
  }, [steps, currentStep]);

  // HIIT
  useEffect(() => {
    if (hiitJson) {
      try {
        const parsedHiit = JSON.parse(hiitJson as string);
        setHiit(parsedHiit);
      } catch (error) {
        console.error('error parsing the params of hiit: ', error);
      }
    }
  }, [hiitJson]);

  useEffect(() => {
    if (hiit) {
      const stepsTemp = convertHiitToSteps(hiit);
      dispatch(initialize({ steps: stepsTemp }));
    }
  }, [hiit]);

  // EMOM
  useEffect(() => {
    if (emomJson) {
      try {
        const parsedEmom = JSON.parse(emomJson as string);
        setEmom(parsedEmom);
      } catch (error) {
        console.error('error parsing the params of emom: ', error);
      }
    }
  }, [emomJson]);

  useEffect(() => {
    if (emom) {
      const stepsTemp = convertEmomToSteps(emom);
      dispatch(initialize({ steps: stepsTemp }));
    }
  }, [emom]);

  // TABATA
  useEffect(() => {
    if (tabataJson) {
      try {
        const parsedTabata = JSON.parse(tabataJson as string);
        setTabata(parsedTabata);
      } catch (error) {
        console.error('error parsing the params of tabata: ', error);
      }
    }
  }, [tabataJson]);

  useEffect(() => {
    if (tabata) {
      const stepsTemp = convertTabataToSteps(tabata);
      dispatch(initialize({ steps: stepsTemp }));
    }
  }, [tabata]);

  // AMRAP
  useEffect(() => {
    if (amrapJson) {
      try {
        const parsedAmrap = JSON.parse(amrapJson as string);
        setAmrap(parsedAmrap);
      } catch (error) {
        console.error('error parsing the params of amrap: ', error);
      }
    }
  }, [amrapJson]);

  useEffect(() => {
    if (amrap) {
      const stepsTemp = convertAmrapToSteps(amrap);
      dispatch(initialize({ steps: stepsTemp }));
    }
  }, [amrap]);

  useEffect(() => {
    if (selectedRoutine) {
      (async () => {
        try {
          const stepsTemp = await convertRoutineToSteps(parseInt(selectedRoutine));
          // console.log('stepsTemp: ', stepsTemp);
          if (stepsTemp) {
            dispatch(initialize({ steps: stepsTemp }));
          }
        } catch (error) {
          console.error('Error converting routine to steps:', error);
        }
      })();
    }
  }, [selectedRoutine]);

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
