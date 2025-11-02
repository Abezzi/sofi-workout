import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Animated, { LayoutAnimationConfig } from 'react-native-reanimated';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Progress } from '../ui/progress';
import { Step } from '@/types/workout';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';

type CountdownPropsType = {
  steps: Step[];
  currentTimer: { index: number; timeLeft: number };
  progress: number;
  isLoading: boolean;
  isPaused: boolean;
  onReady: () => void;
};

const Countdown = ({
  steps,
  currentTimer,
  progress,
  isLoading,
  isPaused,
  onReady,
}: CountdownPropsType) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (seconds >= 60) {
      return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return seconds.toString();
  };

  const { index: currentStepIndex, timeLeft } = currentTimer;
  const currentStep = steps[currentStepIndex] || { name: 'Waiting', quantity: 0 };
  const nextStep = steps[currentStepIndex + 1] || { name: 'Complete' };
  const isWorkoutComplete = currentStepIndex >= steps.length;
  const isAutomatic = currentStep.automatic;
  const { t } = useTranslation();

  return (
    <Card
      className={`rounder-2xl w-full max-w-sm p-6 ${currentStep.isRest ? '' : 'bg-green-100 dark:bg-green-700'}`}>
      <CardHeader>
        <CardTitle className="pb-2 text-center uppercase">
          {isLoading ? 'Loading...' : isWorkoutComplete ? 'Workout Complete' : currentStep.name}
          {isPaused && !isLoading && !isWorkoutComplete && ` (${t('convert_routine.paused')})`}
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
            ) : isAutomatic ? (
              <Text className="truncate text-8xl">{formatTime(timeLeft)}</Text>
            ) : (
              <Text className="text-6xl">
                {currentStep.quantity}x{currentStep.weight} kg
              </Text>
            )}
          </Animated.View>
        </LayoutAnimationConfig>
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
        {!isAutomatic ? (
          <Button variant={'outline'} onPress={onReady}>
            <Text className="uppercase">{t('countdown_screen.ready')}</Text>
          </Button>
        ) : (
          <></>
        )}
        <View className="flex-row items-center overflow-hidden">
          <Text className="text-muted-foreground">
            {t('convert_routine.next')}: {isLoading ? '...' : nextStep.name}
          </Text>
        </View>
      </CardFooter>
    </Card>
  );
};

export default Countdown;
