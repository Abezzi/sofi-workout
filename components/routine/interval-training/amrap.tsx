import FullScreenLoader from '@/components/base/full-screen-loader';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { formatTimeLong } from '@/utils/format-time';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Amrap {
  workTime: number;
}

export default function Amrap() {
  const [totalTime, setTotalTime] = useState<number>(0);
  const [amrap, setAmrap] = useState<Amrap>({
    workTime: 1200,
  });
  const router = useRouter();
  const scale = useSharedValue(1);
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);

  const handleStart = async () => {
    setLoading(true);
    await new Promise(requestAnimationFrame);
    // animation when button is pressed
    scale.value = withSequence(
      // scale down
      withSpring(0.8, { damping: 10, stiffness: 100 }),
      // bounce back
      withSpring(1, { damping: 10, stiffness: 100 })
    );
    // navigate to workout screen
    router.push({
      pathname: '/(tabs)/workout',
      params: { amrapJson: JSON.stringify(amrap) },
    });
    setLoading(false);
  };

  // calculates the amount of seconds based on the user input
  const getTotalTime = () => {
    let result: number = 0;
    if (amrap) {
      const cycleTime = amrap.workTime;
      result = cycleTime;
    }
    setTotalTime(result);
  };

  // calculates the total time after each user input
  useEffect(() => {
    getTotalTime();
  }, [amrap]);

  const handleInputChange = (field: keyof Amrap, value: string) => {
    // converts inputs from string to number
    const numValue = Number(value);
    if (isNaN(numValue)) return;
    setAmrap((prev) => ({
      ...prev,
      [field]: numValue,
    }));
  };

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Text>{t('interval_training.amrap.title')}</Text>
        </CardTitle>
        <CardDescription>
          <View>
            <Text className="text-sm text-muted-foreground">
              {t('interval_training.amrap.description')}
            </Text>
          </View>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <View className="gap-3">
          <View className="flex flex-row items-center justify-between">
            <Label htmlFor="work">{t('interval_training.work')}</Label>
            <Input
              className="w-auto"
              id="work"
              keyboardType="numeric"
              selectTextOnFocus={true}
              value={amrap.workTime.toString()}
              onChangeText={(work) => handleInputChange('workTime', work)}
            />
          </View>
        </View>
        <View className="items-center pt-2">
          <Text>{t('interval_training.total_time')}</Text>
          <Text className="font-bold">{formatTimeLong(totalTime)}</Text>
        </View>
      </CardContent>
      <CardFooter className="flex-col gap-3 pb-0">
        <AnimatedPressable style={[animatedStyles]}>
          <Button onPress={handleStart}>
            <Text>{t('interval_training.start')}</Text>
          </Button>
        </AnimatedPressable>
      </CardFooter>
      <FullScreenLoader visible={loading} />
    </Card>
  );
}
