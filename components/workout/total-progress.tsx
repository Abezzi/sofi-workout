import { View } from 'react-native';
import Animated, { FadeInUp, FadeOutDown, LayoutAnimationConfig } from 'react-native-reanimated';
import { Progress } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';
import { useEffect, useState } from 'react';
import { Step } from '@/types/workout';

interface TotalProgressProps {
  steps: Step[];
  currentStep: number;
}

const TotalProgress = ({ steps, currentStep }: TotalProgressProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentStep) {
      updateProgressValue();
    }
  }, [currentStep]);

  function updateProgressValue() {
    const progress: number = Math.round((currentStep / steps.length) * 100);
    setProgress(progress);
  }

  return (
    <>
      <View className="mx-2 flex-row items-center overflow-hidden p-2">
        <View className="relative h-8 flex-1">
          <Progress
            value={progress}
            className="h-8 flex-1 border border-border outline"
            indicatorClassName="bg-primary-foreground"
          />
          <LayoutAnimationConfig skipEntering>
            <Animated.View
              key={progress}
              entering={FadeInUp}
              exiting={FadeOutDown}
              className="absolute inset-0 items-center justify-center">
              <Text className="text-gray text-lg font-bold outline dark:text-white">
                {progress}%
              </Text>
            </Animated.View>
          </LayoutAnimationConfig>
        </View>
      </View>
    </>
  );
};

export default TotalProgress;
