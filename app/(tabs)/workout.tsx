import Countdown from '@/components/workout/countdown';
import MediaControl from '@/components/workout/media-control';
import RoutineDisplay from '@/components/workout/routine-display';
import TotalProgress from '@/components/workout/total-progress';
import { useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
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
  nextStepAndStart,
} from '@/src/store/slices/workout/timerSlice';
import { useSelector } from 'react-redux';
import { View } from 'react-native';
import {
  convertHiitToSteps,
  convertEmomToSteps,
  convertTabataToSteps,
  convertAmrapToSteps,
} from '@/components/workout/convert-interval-routines';
import { convertRoutineToSteps } from '@/components/routine/convert-routine';
import * as Speech from 'expo-speech';
import countdownSounds from '@/components/workout/countdown-sounds';
import { useTranslation } from 'react-i18next';
import { getRoutineById } from '@/db/queries/routine.queries';
import FullScreenLoader from '@/components/base/full-screen-loader';

export default function WorkoutScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { steps, currentTimer, progress, isPaused, isLoading, currentStep } = useSelector(
    (state: RootState) => state.timer
  );
  const [currentSoundFile, setCurrentSoundFile] = useState<any>(null);
  const player = useAudioPlayer(currentSoundFile);
  const [speechLanguage, setSpeechLanguage] = useState<string>('');
  const currentLanguage = useSelector((state: RootState) => state.locale.currentLanguage);
  const [countdownVoice, setCountdownVoice] = useState<string>('');
  const currentCountdownVoice = useSelector(
    (state: RootState) => state.settings.currentCountdownVoice
  );
  const { t } = useTranslation();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const { hiitJson, emomJson, tabataJson, amrapJson, selectedRoutine } = params as any;
  const [isInitializing, setIsInitializing] = useState(true);
  const [isWorkoutComplete, setIsWorkoutComplete] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadRoutine = async () => {
      if (!mounted) return;

      setIsInitializing(true);
      // reset everything
      dispatch(initialize({ steps: [] }));

      try {
        let stepsTemp: any[] = [];
        let title = '';

        if (hiitJson) {
          const parsed = JSON.parse(hiitJson);
          stepsTemp = convertHiitToSteps(parsed, t);
          title = t('interval_training.hiit.title');
        } else if (emomJson) {
          const parsed = JSON.parse(emomJson);
          stepsTemp = convertEmomToSteps(parsed, t);
          title = t('interval_training.emom.title');
        } else if (tabataJson) {
          const parsed = JSON.parse(tabataJson);
          stepsTemp = convertTabataToSteps(parsed, t);
          title = t('interval_training.tabata.title');
        } else if (amrapJson) {
          const parsed = JSON.parse(amrapJson);
          stepsTemp = convertAmrapToSteps(parsed, t);
          title = t('interval_training.amrap.title');
        } else if (selectedRoutine) {
          const routineId = parseInt(selectedRoutine);
          const routine = await getRoutineById(routineId);
          stepsTemp = await convertRoutineToSteps(routineId, t);
          title = routine?.name || '';
        }

        if (stepsTemp.length > 0) {
          dispatch(initialize({ steps: stepsTemp }));
          navigation.setOptions({ headerTitle: title });
        }
      } catch (error) {
        console.error('error loading routine: ', error);
      } finally {
        if (mounted) {
          setIsInitializing(false);
          setIsWorkoutComplete(false);
        }
      }
    };

    loadRoutine();

    return () => {
      mounted = false;
    };
  }, [hiitJson, amrapJson, tabataJson, emomJson, selectedRoutine, dispatch, t, navigation]);

  // sets and updates the speech language
  useEffect(() => {
    if (currentLanguage === 'en') {
      setSpeechLanguage('en-ENG');
    } else if (currentLanguage === 'es') {
      setSpeechLanguage('es-MX');
    } else if (currentLanguage === 'ko') {
      setSpeechLanguage('ko-KR');
    }
  }, [currentLanguage]);

  // set the countdown voice from the assets
  useEffect(() => {
    setCountdownVoice(currentCountdownVoice);
  }, [currentCountdownVoice]);

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

  const handleReady = () => {
    dispatch(nextStepAndStart());
  };

  const handleFinish = () => {
    console.log('finisheeeeedd');
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

  // using callback because it prevents double-playing if react re-renders
  const handleWorkoutComplete = useCallback(() => {
    setIsWorkoutComplete(true);
    if (isWorkoutComplete) playSound(require('../../assets/audio/victory.mp3'));
  }, []);

  // timer logic with audio
  useEffect(() => {
    if (isLoading || !steps.length || isPaused) return;

    const interval = setInterval(() => {
      const state = store.getState().timer;
      const currentTimeLeft = state.currentTimer.timeLeft;
      const currentStepObj = state.steps[currentTimer.index];

      if (currentTimeLeft === 31 && currentStepObj?.quantity >= 30) {
        playSound(countdownSounds.alertSound);
      } else if (currentTimeLeft === 10) {
        playSound(require('../../assets/audio/alarm.mp3'));
      } else if (currentTimeLeft === 6) {
        playSound(countdownSounds.getCountdownSound(countdownVoice, '5'));
      } else if (currentTimeLeft === 5) {
        playSound(countdownSounds.getCountdownSound(countdownVoice, '4'));
      } else if (currentTimeLeft === 4) {
        playSound(countdownSounds.getCountdownSound(countdownVoice, '3'));
      } else if (currentTimeLeft === 3) {
        playSound(countdownSounds.getCountdownSound(countdownVoice, '2'));
      } else if (currentTimeLeft === 2) {
        playSound(countdownSounds.getCountdownSound(countdownVoice, '1'));
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
    if (currentStep) {
      const currentStepObj = state.steps[currentStep];

      const tellWhichStepIsNext = (stepName: string) => {
        const speech = stepName;
        Speech.speak(speech, { language: speechLanguage });
      };

      if (currentStepObj && currentStepObj.name) {
        tellWhichStepIsNext(currentStepObj.name);
      }
    }
  }, [steps, currentStep]);

  // keep awake when screen loaded, deactivate it when leaving
  useFocusEffect(
    useCallback(() => {
      activateKeepAwakeAsync();
      return () => {
        // resets steps when unfocus
        dispatch(initialize({ steps: [] }));
        setIsWorkoutComplete(false);
        deactivateKeepAwake();
      };
    }, [dispatch])
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
        onWorkoutComplete={handleWorkoutComplete}
        onReady={handleReady}
        onFinish={handleFinish}
      />
      <MediaControl
        onStartPause={handleStartPause}
        onStop={handleStop}
        onRewind={handleRewind}
        onFastForward={handleFastForward}
        isPaused={isPaused}
      />
      <RoutineDisplay />
      <FullScreenLoader
        visible={isInitializing || steps.length === 0}
        message="Loading Routine..."
      />
    </View>
  );
}
