import { FlatList, Pressable, View } from 'react-native';
import { Text } from '../ui/text';
import { Card } from '@/components/ui/card';
import {
  getRoutinesWithExerciseAndRest,
  RoutineWithExerciseAndRest,
} from '@/db/queries/routine.queries';
import { memo, useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { router } from 'expo-router';
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
  id: number;
}

const RoutineItem = memo(({ name, exercises, id }: RoutineItemProps) => {
  // filter exercises to get unique categories
  const uniqueCategories = exercises.filter(
    (exercise, index, self) =>
      exercise.category && index === self.findIndex((e) => e.category?.id === exercise.category?.id)
  );

  return (
    <Pressable onPress={() => handleOnPress(id)}>
      <View className="w-48 items-center rounded-lg border border-primary bg-gray-100 p-3 dark:bg-primary-foreground">
        <Text
          className="line-clamp-2 break-words text-center align-middle text-base font-medium"
          numberOfLines={2}
          ellipsizeMode="tail"
          style={{ minHeight: 55 }}>
          {name}
        </Text>
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
            <Text>No categories</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
});

const handleOnPress = (id: number) => {
  router.push({
    pathname: '/(tabs)/workout',
    params: { selectedRoutine: id },
  });
};

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
    <Card className="m-0 p-0">
      {routines && routines.length > 0 ? (
        <>
          <FlatList
            data={routines}
            horizontal={true}
            renderItem={({ item }) => (
              <RoutineItem name={item.name} exercises={item.exercises} id={item.id} />
            )}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            getItemLayout={getItemLayout}
            ItemSeparatorComponent={() => <View className="w-1" />}
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
