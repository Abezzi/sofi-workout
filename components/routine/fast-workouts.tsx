import { Pressable, View } from 'react-native';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Text } from '../ui/text';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { formatTime } from '@/utils/format-time';
import { Button } from '../ui/button';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Hiit {
  rounds: number;
  workTime: number;
  restTime: number;
  cycles: number;
  cycleRestTime: number;
}

export default function FastWorkouts() {
  const [tabValue, setTabValue] = useState<string>('hiit');
  const [totalTime, setTotalTime] = useState<number>(0);
  const [cycleChecked, setCycleChecked] = useState<boolean>(false);
  const [hiit, setHiit] = useState<Hiit>({
    rounds: 0,
    workTime: 0,
    restTime: 0,
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
      params: { hiitJson: JSON.stringify(hiit), totalTime: totalTime },
    });
  };

  // calculates the amount of seconds based on the user input
  const getTotalTime = () => {
    let result: number = 0;
    if (hiit) {
      const cycleTime = (hiit.workTime + hiit.restTime) * hiit.rounds;
      const totalCycleRestTime = hiit.cycles > 1 ? (hiit.cycles - 1) * hiit.cycleRestTime : 0;
      result = hiit.cycles * cycleTime + totalCycleRestTime;
    }
    setTotalTime(result);
  };

  // calculates the total time after each user input
  useEffect(() => {
    getTotalTime();
  }, [hiit]);

  // reset cycle to one and cycle rest to 0 if the cycle check is unchecked
  useEffect(() => {
    if (!cycleChecked) {
      setHiit((prev) => ({
        ...prev,
        cycles: 1,
        cycleRestTime: 0,
      }));
    }
  }, [cycleChecked]);

  const handleInputChange = (field: keyof Hiit, value: string) => {
    // converts inputs from string to number
    const numValue = Number(value);
    if (isNaN(numValue)) return;
    setHiit((prev) => ({
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
    <View className="flex w-full max-w-sm flex-col gap-6 pt-4">
      <Tabs value={tabValue} onValueChange={setTabValue}>
        <TabsList>
          <TabsTrigger value="hiit">
            <Text>HIIT</Text>
          </TabsTrigger>
          <TabsTrigger value="emom">
            <Text>EMOM</Text>
          </TabsTrigger>
          <TabsTrigger value="tabata">
            <Text>Tabata</Text>
          </TabsTrigger>
          <TabsTrigger value="amrap">
            <Text>AMRAP</Text>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="hiit">
          <Card>
            <CardHeader>
              <CardTitle>
                <Text>HIIT</Text>
              </CardTitle>
              <CardDescription>
                <View>
                  <Text className="text-sm text-muted-foreground">
                    Workout for a defined amount of time with rest in between each round.
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
                    value={hiit.rounds.toString()}
                    onChangeText={(rounds) => handleInputChange('rounds', rounds)}
                  />
                  <Label htmlFor="work">Work</Label>
                  <Input
                    className="w-auto"
                    id="work"
                    keyboardType="numeric"
                    selectTextOnFocus={true}
                    value={hiit.workTime.toString()}
                    onChangeText={(work) => handleInputChange('workTime', work)}
                  />
                  <Label htmlFor="rest">Rest</Label>
                  <Input
                    className="w-auto"
                    id="rest"
                    keyboardType="numeric"
                    selectTextOnFocus={true}
                    value={hiit.restTime.toString()}
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
                      value={hiit.cycles.toString()}
                      onChangeText={(cycles) => handleInputChange('cycles', cycles)}
                    />
                    <Label htmlFor="cyleRestTime">Cycle Rest Time</Label>
                    <Input
                      className="w-auto"
                      id="cyleRestTime"
                      keyboardType="numeric"
                      selectTextOnFocus={true}
                      value={hiit.cycleRestTime.toString()}
                      onChangeText={(cycleRest) => handleInputChange('cycleRestTime', cycleRest)}
                    />
                  </View>
                ) : (
                  <></>
                )}
              </View>
              <View className="items-center pt-2">
                <Text>Total Time</Text>
                <Text className="font-bold">{formatTime(totalTime)}</Text>
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
        </TabsContent>
      </Tabs>
    </View>
  );
}
