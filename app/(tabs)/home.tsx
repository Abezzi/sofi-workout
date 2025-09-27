import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useEffect, useRef, useState } from 'react';
import { View, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TriggerRef } from '@rn-primitives/select';
import { Routine } from '@/db/schema';
import { getAllRoutines } from '@/db/queries/routine.queries';
import { Label } from '@/components/ui/label';
import FastWorkouts from '@/components/routine/fast-workouts';

type Option = {
  value: string;
  label: string;
};

export default function Screen() {
  const insets = useSafeAreaInsets();
  const [selectedRoutine, setSelectedRoutine] = useState<Option | undefined>(undefined);
  const [loadingRoutines, setLoadingRoutines] = useState<boolean>(false);
  const [routineData, setRoutineData] = useState<Routine[]>([]);
  const ref = useRef<TriggerRef>(null);
  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({
      ios: insets.bottom,
      android: insets.bottom + 24,
    }),
  };

  function handleNewRoutine() {
    router.push({ pathname: '/routine/new-routine' });
  }

  function handleCopyRoutine() {
    router.push({ pathname: '/routine/copy-routine' });
  }

  const loadAllRoutines = async () => {
    setLoadingRoutines(true);
    const data = await getAllRoutines();
    if (data !== undefined) setRoutineData(data);
    setLoadingRoutines(false);
  };

  useEffect(() => {
    loadAllRoutines();
  }, []);

  const handleStart = () => {
    console.log('starting...');
  };

  return (
    <SafeAreaView className="flex-1" style={{ paddingBottom: insets.bottom }}>
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          {/*Buttons Top*/}
          <View className="flex-row items-center justify-center">
            <Button onPress={handleNewRoutine}>
              <Text>New Routine</Text>
            </Button>
            <Button
              variant="outline"
              className="shadow shadow-foreground/5"
              onPress={handleCopyRoutine}>
              <Text>Copy Routine</Text>
            </Button>
          </View>
        </CardHeader>

        <CardContent>
          {/*Routine Select*/}
          <View>
            <Label htmlFor="routine">Routine to load:</Label>
            <Select
              id="routine"
              disabled={loadingRoutines}
              value={selectedRoutine}
              onValueChange={(option) => setSelectedRoutine(option)}>
              <SelectTrigger ref={ref}>
                <SelectValue placeholder="Select a Routine..." className="text-lg" />
              </SelectTrigger>
              <SelectContent insets={contentInsets} className="max-h-96 w-auto rounded-md">
                <SelectGroup>
                  <SelectLabel className="text-lg">routines</SelectLabel>
                  {routineData.map((routine) => (
                    <SelectItem key={routine.id} label={routine.name} value={routine.id.toString()}>
                      {routine.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </View>
          {/*Tabs with the quick routines*/}
          <FastWorkouts />
        </CardContent>
        <CardFooter className="flex-col gap-3 pb-0">
          <Button onPress={handleStart}>
            <Text>Start</Text>
          </Button>
        </CardFooter>
      </Card>
    </SafeAreaView>
  );
}
