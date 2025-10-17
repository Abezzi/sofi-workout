import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useEffect, useRef, useState } from 'react';
import { View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import RoutineList from '@/components/routine/routine-list';

type Option = {
  value: string;
  label: string;
};

export default function Screen() {
  const insets = useSafeAreaInsets();

  function handleNewRoutine() {
    router.push({ pathname: '/routine/new-routine' });
  }

  function handleCopyRoutine() {
    router.push({ pathname: '/routine/copy-routine' });
  }

  return (
    <View className="flex-1" style={{ paddingBottom: insets.bottom }}>
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
          {/*Routine List*/}
          <Label htmlFor="routine">Select a Routine:</Label>
          <RoutineList />
          {/*Tabs with the quick routines*/}
          <FastWorkouts />
        </CardContent>
        {/*
        <CardFooter className="flex-col gap-3 pb-0">
          <Button onPress={handleStart}>
            <Text>Start</Text>
          </Button>
        </CardFooter>
        */}
      </Card>
    </View>
  );
}
