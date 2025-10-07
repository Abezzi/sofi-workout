import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Animated, { LayoutAnimationConfig } from 'react-native-reanimated';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Progress } from '../ui/progress';

type Step = {
  step: number;
  duration: number;
  name: string;
  automatic: boolean;
  isRest: boolean;
};

type CountdownPropsType = {
  steps: Step[];
  currentTimer: { index: number; timeLeft: number };
  progress: number;
  isLoading: boolean;
  isPaused: boolean;
};

const Countdown = ({ steps, currentTimer, progress, isLoading, isPaused }: CountdownPropsType) => {
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
      <Card
        className={`rounder-2xl w-full max-w-sm p-6 ${currentStep.isRest ? '' : 'bg-green-100'}`}>
        <CardHeader>
          <CardTitle className="pb-2 text-center uppercase">
            {isLoading ? 'Loading...' : isWorkoutComplete ? 'Workout Complete' : currentStep.name}
            {isPaused && !isLoading && !isWorkoutComplete && ' (Paused)'}
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
                <Text className="truncate text-8xl">{formatTime(timeLeft)}</Text>
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
