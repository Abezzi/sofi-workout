import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ToastAndroid,
  View,
} from 'react-native';
import { Text } from '../ui/text';
import { Card } from '@/components/ui/card';
import {
  deleteRoutineById,
  getRoutinesWithExerciseAndRest,
  RoutineWithExerciseAndRest,
} from '@/db/queries/routine.queries';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { router } from 'expo-router';
import { Icon } from '../ui/icon';
import { Eye, Ghost, Pencil, X } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

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
  isActive: boolean;
  setActiveItem: (id: number | null) => void;
}

const sendToast = (message: string) => {
  ToastAndroid.showWithGravity(message, ToastAndroid.SHORT, ToastAndroid.CENTER);
};

export default function RoutineList() {
  const [routines, setRoutines] = useState<RoutineWithExerciseAndRest[]>();
  const [activeItemId, setActiveItemId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const getRoutines = async () => {
    try {
      setLoading(true);
      await new Promise(requestAnimationFrame);
      let routineData: RoutineWithExerciseAndRest[] = await getRoutinesWithExerciseAndRest();

      if (routineData !== undefined) {
        setRoutines(routineData);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await getRoutines();
      sendToast('Routines Refreshed');
    } catch (error) {
      console.error('error refreshing ', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

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

  const emptyListComponent = () => {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="font-semibold">Your routine list is empty</Text>
        <Text className="text-sm text-muted-foreground">
          add routines by pressing 'New Routine'
        </Text>
        <Icon as={Ghost} className="size-8" />
      </View>
    );
  };

  const RoutineItem = memo(({ name, exercises, id, isActive, setActiveItem }: RoutineItemProps) => {
    const longPressRef = useRef(false);
    const opacity = useSharedValue(0);
    const translateX = useSharedValue(-30);
    const width = useSharedValue(0);

    // filter exercises to get unique categories
    const uniqueCategories = exercises.filter(
      (exercise, index, self) =>
        exercise.category &&
        index === self.findIndex((e) => e.category?.id === exercise.category?.id)
    );

    useEffect(() => {
      opacity.value = withTiming(isActive ? 1 : 0, { duration: 200 });
      translateX.value = withTiming(isActive ? 0 : -30, { duration: 200 });
      width.value = withTiming(isActive ? 24 : 0, { duration: 200 });
    }, [isActive, opacity, translateX, width]);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ translateX: translateX.value }],
      width: width.value,
      pointerEvents: opacity.value > 0 ? 'auto' : 'none',
    }));

    const handleOnPress = (id: number) => {
      router.push({
        pathname: '/(tabs)/workout',
        params: { selectedRoutine: id },
      });
    };

    const handleOnEdit = (id: number) => {
      router.push({
        pathname: '/routine/edit-routine',
        params: { selectedRoutine: id },
      });
    };

    const handleOnDelete = async (id: number) => {
      setLoading(true);
      await new Promise(requestAnimationFrame);
      await deleteRoutineById(id);
      await getRoutines();
      sendToast('Routine Deleted Successfully!');
      setLoading(false);
    };

    const handleOnView = (id: number) => {
      router.push({
        pathname: '/(tabs)/workout',
        params: { selectedRoutine: id },
      });
    };

    return (
      <View className="flex flex-row gap-2 rounded-lg border border-primary bg-gray-100 p-3 dark:bg-primary-foreground">
        {/* view at the left side */}
        <Animated.View className="flex flex-col justify-between" style={animatedStyle}>
          <Pressable
            onPress={() => {
              handleOnEdit(id);
              setActiveItem(null);
            }}>
            <Icon as={Pencil} className="size-6" />
          </Pressable>
          <Pressable
            onPress={() => {
              handleOnView(id);
              setActiveItem(null);
            }}>
            <Icon as={Eye} className="size-6" />
          </Pressable>
          <Pressable
            onPress={() => {
              handleOnDelete(id);
              setActiveItem(null);
            }}>
            <Icon as={X} className="size-6" />
          </Pressable>
        </Animated.View>
        {/* view at the right side */}
        <View className="flex-1">
          <Pressable
            onPress={() => {
              if (!longPressRef.current) {
                handleOnPress(id);
              }
              longPressRef.current = false;
            }}
            onLongPress={() => {
              longPressRef.current = true;
              // keep the pressed routine item id saved to hide the options of others routine items
              setActiveItem(isActive ? null : id);
              // little vibration when long press
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }}
            className="w-48 items-center">
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
                    <Text
                      key={exercise.category.id}
                      style={{ color: `${exercise.category.color}` }}>
                      ■
                    </Text>
                  ) : null
                )
              ) : (
                <Text>No categories</Text>
              )}
            </View>
          </Pressable>
        </View>
      </View>
    );
  });

  return (
    <Card className="m-0 p-0">
      <>
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" />
            <Text>Loading Routines...</Text>
          </View>
        ) : (
          <FlatList
            data={routines}
            horizontal={true}
            renderItem={({ item }) => (
              <RoutineItem
                name={item.name}
                exercises={item.exercises}
                id={item.id}
                isActive={activeItemId === item.id}
                setActiveItem={setActiveItemId}
              />
            )}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            getItemLayout={getItemLayout}
            ItemSeparatorComponent={() => <View className="w-1" />}
            ListEmptyComponent={emptyListComponent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        )}
      </>
    </Card>
  );
}
