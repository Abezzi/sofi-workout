import { View } from 'react-native';
import Animated, { FadeInUp, FadeOutDown, LayoutAnimationConfig } from 'react-native-reanimated';
import { Progress } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';
import { useEffect, useState } from 'react';

type Step = {
  step: number;
  duration: number;
  name: string;
  automatic: boolean;
  isRest: boolean;
};

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
    console.log('ASD currentStep: ', currentStep, 'len: ', steps.length, 'progress ', progress);
    setProgress(progress);
  }

  return (
    <>
      <View className="flex-row items-center overflow-hidden p-2">
        <View className="relative h-8 flex-1">
          <Progress value={progress} className="h-8 flex-1" indicatorClassName="bg-slate-500" />
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

        <Text></Text>
      </View>
    </>
  );
};

export default TotalProgress;
