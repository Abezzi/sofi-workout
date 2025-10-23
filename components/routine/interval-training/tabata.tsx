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
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { formatTimeLong } from '@/utils/format-time';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Tabata {
  rounds: number;
  workTime: number;
  restTime: number;
  cycles: number;
  cycleRestTime: number;
}

export default function Tabata() {
  const [totalTime, setTotalTime] = useState<number>(0);
  const [cycleChecked, setCycleChecked] = useState<boolean>(false);
  const [tabata, setTabata] = useState<Tabata>({
    rounds: 8,
    workTime: 20,
    restTime: 10,
    cycles: 1,
    cycleRestTime: 0,
  });
  const router = useRouter();
  const scale = useSharedValue(1);

  const handleStart = () => {
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
      params: { tabataJson: JSON.stringify(tabata) },
    });
  };

  // calculates the amount of seconds based on the user input
  const getTotalTime = () => {
    let result: number = 0;
    if (tabata) {
      const cycleTime = (tabata.workTime + tabata.restTime) * tabata.rounds;
      const totalCycleRestTime = tabata.cycles > 1 ? (tabata.cycles - 1) * tabata.cycleRestTime : 0;
      result = tabata.cycles * cycleTime + totalCycleRestTime;
    }
    setTotalTime(result);
  };

  // calculates the total time after each user input
  useEffect(() => {
    getTotalTime();
  }, [tabata]);

  // reset cycle to one and cycle rest to 0 if the cycle check is unchecked
  useEffect(() => {
    if (!cycleChecked) {
      setTabata((prev) => ({
        ...prev,
        cycles: 1,
        cycleRestTime: 0,
      }));
    }
  }, [cycleChecked]);

  const handleInputChange = (field: keyof Tabata, value: string) => {
    // converts inputs from string to number
    const numValue = Number(value);
    if (isNaN(numValue)) return;
    setTabata((prev) => ({
      ...prev,
      [field]: numValue,
    }));
  };

  const onCheckedChange = (checked: boolean) => {
    setCycleChecked(checked);
  };

  const onLabelPress = () => {
    setCycleChecked((prev) => !prev);
  };

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Text>Tabata</Text>
        </CardTitle>
        <CardDescription>
          <View>
            <Text className="text-sm text-muted-foreground">
              Short intensity max effort training
            </Text>
          </View>
          <View className="flex flex-row gap-2">
            <Label nativeID="cycleCheck" htmlFor="cycleCheck" onPress={onLabelPress}>
              Cycles
            </Label>
            <Switch
              id="cycleCheck"
              nativeID="cycleCheck"
              checked={cycleChecked}
              onCheckedChange={onCheckedChange}
            />
          </View>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <View className="gap-3">
          <View className="flex flex-row items-center justify-between">
            <Label htmlFor="rounds">Rounds</Label>
            <Input
              className="w-auto"
              id="rounds"
              keyboardType="numeric"
              selectTextOnFocus={true}
              value={tabata.rounds.toString()}
              onChangeText={(rounds) => handleInputChange('rounds', rounds)}
            />
            <Label htmlFor="work">Work</Label>
            <Input
              className="w-auto"
              id="work"
              keyboardType="numeric"
              selectTextOnFocus={true}
              value={tabata.workTime.toString()}
              onChangeText={(work) => handleInputChange('workTime', work)}
            />
            <Label htmlFor="rest">Rest</Label>
            <Input
              className="w-auto"
              id="rest"
              keyboardType="numeric"
              selectTextOnFocus={true}
              value={tabata.restTime.toString()}
              onChangeText={(rest) => handleInputChange('restTime', rest)}
            />
          </View>
          {cycleChecked ? (
            <View className="flex flex-row items-center justify-between">
              <Label htmlFor="cyles">Cycles</Label>
              <Input
                className="w-auto"
                id="cycles"
                keyboardType="numeric"
                selectTextOnFocus={true}
                value={tabata.cycles.toString()}
                onChangeText={(cycles) => handleInputChange('cycles', cycles)}
              />
              <Label htmlFor="cyleRestTime">Cycle Rest Time</Label>
              <Input
                className="w-auto"
                id="cyleRestTime"
                keyboardType="numeric"
                selectTextOnFocus={true}
                value={tabata.cycleRestTime.toString()}
                onChangeText={(cycleRest) => handleInputChange('cycleRestTime', cycleRest)}
              />
            </View>
          ) : (
            <></>
          )}
        </View>
        <View className="items-center pt-2">
          <Text>Total Time</Text>
          <Text className="font-bold">{formatTimeLong(totalTime)}</Text>
        </View>
      </CardContent>
      <CardFooter className="flex-col gap-3 pb-0">
        <AnimatedPressable style={[animatedStyles]}>
          <Button onPress={handleStart}>
            <Text>Start</Text>
          </Button>
        </AnimatedPressable>
      </CardFooter>
    </Card>
  );
}
