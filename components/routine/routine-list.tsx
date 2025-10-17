import { FlatList, View } from 'react-native';
import { Text } from '../ui/text';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  getRoutinesWithExerciseAndRest,
  RoutineWithExerciseAndRest,
} from '@/db/queries/routine.queries';
import { memo, useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Icon } from '../ui/icon';
import { Ghost } from 'lucide-react-native';

interface RoutineItemProps {
  name: string;
  exercises: {
    id: number;
    name: string;
    description: string | null;
    category: { id: number; name: string; color: string } | null;
    exerciseType: { id: number; name: string } | null;
    sets: {
      id: number;
      routineExerciseId: number;
      setNumber: number;
      quantity: number;
      weight: number;
    }[];
  }[];
}

const RoutineItem = memo(({ name, exercises }: RoutineItemProps) => {
  // filter exercises to get unique categories
  const uniqueCategories = exercises.filter(
    (exercise, index, self) =>
      exercise.category && index === self.findIndex((e) => e.category?.id === exercise.category?.id)
  );

  return (
    <View className="mb-2 items-center rounded-lg border-2 border-primary bg-gray-100 p-3 dark:bg-primary-foreground">
      <Text className="text-base font-semibold">{name}</Text>
      <View className="flex flex-row">
        {uniqueCategories.length > 0 ? (
          uniqueCategories.map((exercise) =>
            exercise.category ? (
              <Text key={exercise.category.id} style={{ color: `${exercise.category.color}` }}>
                ■
              </Text>
            ) : null
          )
        ) : (
          <Text>No categories available</Text>
        )}
      </View>
    </View>
  );
});

export default function RoutineList() {
  const [routines, setRoutines] = useState<RoutineWithExerciseAndRest[]>();

  const getRoutines = async () => {
    try {
      let routineData: RoutineWithExerciseAndRest[] = await getRoutinesWithExerciseAndRest();

      if (routineData !== undefined) {
        setRoutines(routineData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getRoutines();
    }, [])
  );

  const getItemLayout = (_: any, index: number) => ({
    // height of each item (adjust based on actual height)
    length: 50,
    offset: 50 * index,
    index,
  });

  return (
    <Card className="p-0 align-middle">
      {routines && routines.length > 0 ? (
        <>
          <FlatList
            data={routines}
            horizontal={true}
            renderItem={({ item }) => <RoutineItem name={item.name} exercises={item.exercises} />}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            getItemLayout={getItemLayout}
            contentContainerStyle={{
              paddingHorizontal: 10,
            }}
          />
        </>
      ) : (
        <View className="items-center">
          <Text className="font-semibold">Your routine list is empty</Text>
          <Text className="text-sm text-muted-foreground">add some by pressing 'New Routine'</Text>
          <Icon as={Ghost} className="size-8" />
        </View>
      )}
    </Card>
  );
}
