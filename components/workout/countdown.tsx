import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Animated, { LayoutAnimationConfig } from 'react-native-reanimated';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Progress } from '../ui/progress';
import { Step } from '@/types/workout';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { useEffect, useRef } from 'react';
import { formatTimeShort, formatTimeVeryShort } from '@/utils/format-time';

type CountdownPropsType = {
  steps: Step[];
  currentTimer: { index: number; timeLeft: number };
  progress: number;
  isLoading: boolean;
  isPaused: boolean;
  totalElapsedSeconds: number;
  onReady: () => void;
  onFinish: () => void;
  onWorkoutComplete: () => void;
};

const Countdown = ({
  steps,
  currentTimer,
  progress,
  isLoading,
  isPaused,
  totalElapsedSeconds,
  onReady,
  onFinish,
  onWorkoutComplete,
}: CountdownPropsType) => {
  const { index: currentStepIndex, timeLeft } = currentTimer;
  const currentStep = steps[currentStepIndex] || { name: 'Waiting', quantity: 0 };
  const nextStep = steps[currentStepIndex + 1] || { name: 'Complete' };
  const isWorkoutComplete = currentStepIndex >= steps.length;
  const isAutomatic = currentStep.automatic;
  const { t } = useTranslation();
  const hasTriggeredComplete = useRef(false);

  // triggers workout complete once per workout when reaching the end of the workout
  useEffect(() => {
    const hasSteps = steps.length > 0;
    const isFinished = hasSteps && currentStepIndex >= steps.length;

    if (isFinished && !isLoading && !hasTriggeredComplete.current) {
      hasTriggeredComplete.current = true;
      onWorkoutComplete();
    }

    if (steps.length === 0 || isLoading) {
      hasTriggeredComplete.current = false;
    }
  }, [steps.length, currentStepIndex, isLoading, onWorkoutComplete]);

  return (
    <Card
      className={`rounder-2xl w-full max-w-sm p-6 ${currentStep.isRest ? '' : 'bg-green-100 dark:bg-green-700'}`}>
      <CardHeader>
        <CardTitle className="pb-2 text-center uppercase">
          {isLoading ? 'Loading...' : isWorkoutComplete ? 'Workout Complete! 🎉' : currentStep.name}
          {isPaused && !isLoading && !isWorkoutComplete && ` (${t('convert_routine.paused')})`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* reps x weight / time left / workout time at the end */}
        <LayoutAnimationConfig skipEntering>
          <Animated.View key={timeLeft} className="items-center">
            {isLoading ? (
              <Text>...</Text>
            ) : isWorkoutComplete && totalElapsedSeconds ? (
              <Text className="text-2xl text-green-600">
                Time: {formatTimeShort(totalElapsedSeconds)}
              </Text>
            ) : isAutomatic ? (
              <Text className="truncate text-8xl">{formatTimeVeryShort(timeLeft)}</Text>
            ) : (
              <Text className="text-6xl">
                {currentStep.quantity}x{currentStep.weight} kg
              </Text>
            )}
          </Animated.View>
        </LayoutAnimationConfig>

        {/* progress bar */}
        {!isLoading && !isWorkoutComplete && isAutomatic && (
          <Progress
            value={progress}
            indicatorClassName={
              timeLeft < 10 ? 'bg-red-500' : timeLeft < 60 ? 'bg-yellow-500' : 'bg-green-500'
            }
          />
        )}
      </CardContent>
      <CardFooter className="flex-col gap-3 pb-0">
        {!isAutomatic && !isWorkoutComplete && (
          <Button variant={'outline'} onPress={onReady}>
            <Text className="uppercase">{t('countdown_screen.ready')}</Text>
          </Button>
        )}
        {isAutomatic && <></>}
        {isWorkoutComplete && (
          <Button variant={'outline'} onPress={onFinish}>
            <Text className="uppercase">Finish Workout</Text>
          </Button>
        )}

        {/* NEXT: workout */}
        {!isWorkoutComplete && (
          <View className="flex-row items-center overflow-hidden">
            <Text className="text-muted-foreground">
              {t('convert_routine.next')}: {isLoading ? '...' : nextStep.name}
            </Text>
          </View>
        )}
      </CardFooter>
    </Card>
  );
};

export default Countdown;
