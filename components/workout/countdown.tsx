import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Animated, { LayoutAnimationConfig } from 'react-native-reanimated';
import { View } from 'react-native'; // Add useRef import
import { Text } from '@/components/ui/text';
import { useEffect, useRef, useState } from 'react';
import { Progress } from '../ui/progress';
import { useAudioPlayer } from 'expo-audio';
import { Check } from 'lucide-react-native';
import { Icon } from '../ui/icon';

type Step = {
  step: number;
  duration: number;
  name: string;
  automatic: boolean;
  isRest: boolean;
};

type CountdownPropsType = {
  steps: Step[];
  onStepChange: (step: number) => void;
};

const Countdown = ({ steps, onStepChange }: CountdownPropsType) => {
  const [currentTimer, setCurrentTimer] = useState({ index: 0, timeLeft: 0 });
  const [progress, setProgress] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | number | null>(null);

  let player = useAudioPlayer(require('../../assets/audio/alert.mp3'));
  let player5 = useAudioPlayer(require('../../assets/audio/countdown/esMX/male/5.mp3'));
  let player4 = useAudioPlayer(require('../../assets/audio/countdown/esMX/male/4.mp3'));
  let player3 = useAudioPlayer(require('../../assets/audio/countdown/esMX/male/3.mp3'));
  let player2 = useAudioPlayer(require('../../assets/audio/countdown/esMX/male/2.mp3'));
  let player1 = useAudioPlayer(require('../../assets/audio/countdown/esMX/male/1.mp3'));
  let infoSound = useAudioPlayer(require('../../assets/audio/info.mp3'));

  // init currentTimer when steps change
  useEffect(() => {
    if (steps.length > 0) {
      setCurrentTimer({ index: 0, timeLeft: steps[0].duration });
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [steps]);

  // single interval for the entire workout
  useEffect(() => {
    if (isLoading) return;

    intervalRef.current = setInterval(() => {
      setCurrentTimer((prev) => {
        if (prev.index >= steps.length) {
          if (intervalRef.current !== null) clearInterval(intervalRef.current);
          return prev; // Workout complete, no more updates
        }

        const currentStep = steps[prev.index];
        if (!currentStep.automatic) {
          // skip non-automatic steps (if any)
          return prev;
        }

        if (prev.timeLeft > 0) {
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        } else {
          const nextIndex = prev.index + 1;
          onStepChange(nextIndex);
          if (nextIndex < steps.length) {
            return { index: nextIndex, timeLeft: steps[nextIndex].duration };
          } else {
            if (intervalRef.current !== null) clearInterval(intervalRef.current);
            // complete
            return { index: nextIndex, timeLeft: 0 };
          }
        }
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLoading, steps, onStepChange]);

  useEffect(() => {
    const { index, timeLeft } = currentTimer;
    // console.log('index: ', index, 'len: ', steps.length);
    if (isLoading || steps.length === 0 || index >= steps.length) return;

    const currentStep = steps[index];
    const percentOfTimeRemaining = (timeLeft / currentStep.duration) * 100;
    setProgress(percentOfTimeRemaining);

    // audio
    if (timeLeft === 30 && currentStep.duration >= 30) {
      player.seekTo(0);
      player.play();
    } else if (timeLeft === 5) {
      player5.seekTo(0);
      player5.play();
    } else if (timeLeft === 4) {
      player4.seekTo(0);
      player4.play();
    } else if (timeLeft === 3) {
      player3.seekTo(0);
      player3.play();
    } else if (timeLeft === 2) {
      player2.seekTo(0);
      player2.play();
    } else if (timeLeft === 1) {
      player1.seekTo(0);
      player1.play();
    } else if (timeLeft === 0) {
      infoSound.seekTo(0);
      infoSound.play();
    }
  }, [currentTimer, steps, isLoading]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (seconds >= 60) {
      return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return seconds.toString();
  };

  const { index: currentStepIndex, timeLeft } = currentTimer;
  const currentStep = steps[currentStepIndex] || { name: 'Waiting', duration: 0 };
  const nextStep = steps[currentStepIndex + 1] || { name: 'Complete' };
  const isWorkoutComplete = currentStepIndex >= steps.length;

  return (
    <View className="items-center justify-center">
      <Card className="rounder-2xl w-full max-w-sm p-6">
        <CardHeader>
          <CardTitle className="pb-2 text-center uppercase">
            {isLoading ? 'Loading...' : isWorkoutComplete ? 'Workout Complete' : currentStep.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LayoutAnimationConfig skipEntering>
            <Animated.View key={timeLeft} className="items-center">
              {isLoading ? (
                <Text>...</Text>
              ) : isWorkoutComplete ? (
                <View className="flex flex-row">
                  <Text className="text-2xl text-green-600">Congratulations!🎉</Text>
                </View>
              ) : (
                <Text className="text-9xl">{formatTime(timeLeft)}</Text>
              )}
            </Animated.View>
          </LayoutAnimationConfig>
          {!isLoading && !isWorkoutComplete && (
            <Progress
              value={progress}
              indicatorClassName={
                timeLeft < 10 ? 'bg-red-500' : timeLeft < 60 ? 'bg-yellow-500' : 'bg-green-500'
              }
            />
          )}
        </CardContent>
        <CardFooter className="flex-col gap-3 pb-0">
          <View className="flex-row items-center overflow-hidden">
            <Text className="text-muted-foreground">NEXT: {isLoading ? '...' : nextStep.name}</Text>
          </View>
        </CardFooter>
      </Card>
    </View>
  );
};

export default Countdown;
