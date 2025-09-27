import { View } from 'react-native';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Text } from '../ui/text';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';

interface Hiit {
  rounds: number;
  workTime: number;
  restTime: number;
  cycles: number;
  cycleRestTime: number;
}

export default function FastWorkouts() {
  const [tabValue, setTabValue] = useState<string>('hiit');
  const [cycleChecked, setCycleChecked] = useState<boolean>(false);
  const [hiit, setHiit] = useState<Hiit>({
    rounds: 0,
    workTime: 0,
    restTime: 0,
    cycles: 1,
    cycleRestTime: 0,
  });

  const handleInputChange = (field: keyof Hiit, value: string) => {
    setHiit((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const onCheckedChange = (checked: boolean) => {
    setCycleChecked(checked);
  };

  const onLabelPress = () => {
    setCycleChecked((prev) => !prev);
  };
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </View>
  );
}
