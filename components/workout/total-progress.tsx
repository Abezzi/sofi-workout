import * as React from 'react';
import { Button } from '@/components/ui/button';
import { View } from 'react-native';
import Animated, { FadeInUp, FadeOutDown, LayoutAnimationConfig } from 'react-native-reanimated';
import { Progress } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';

const TotalProgress = () => {
  const [progress, setProgress] = React.useState(0);

  function updateProgressValue() {
    setProgress(Math.floor(Math.random() * 100));
  }

  return (
    <>
      <View className="flex-row items-center overflow-hidden p-2">
        <View className="relative h-8 flex-1">
          <Progress value={progress} className="h-8 flex-1" indicatorClassName="bg-purple-500" />
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
      {/*TODO: remove this*/}
      <Button onPress={updateProgressValue}>
        <Text>TEST total progress</Text>
      </Button>
    </>
  );
};

export default TotalProgress;
