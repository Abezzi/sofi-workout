import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import SwipeableItem, { useSwipeableItemParams, OpenDirection } from 'react-native-swipeable-item';
import { Icon } from '../ui/icon';
import { Copy, Delete, Trash } from 'lucide-react-native';

interface ExerciseItem {
  key: string;
  exerciseName: string;
  exerciseTypeId: number;
  categoryId: number;
  amount: string;
}

interface DraggableExerciseListProps {
  data: ExerciseItem[];
  onDataChange?: (newData: ExerciseItem[]) => void;
}

export function DraggableExerciseList({
  data: propData,
  onDataChange,
}: DraggableExerciseListProps) {
  const [data, setData] = useState<ExerciseItem[]>(propData);

  useEffect(() => {
    setData(propData);
  }, [propData]);

  const handleDragEnd = ({ data: newData }: { data: ExerciseItem[] }) => {
    setData(newData);
    onDataChange?.(newData);
  };

  const UnderlayLeft = ({ item }: { item: ExerciseItem }) => {
    const { close } = useSwipeableItemParams<ExerciseItem>();

    const handleDelete = async () => {
      await close();
      const newData = data.filter((exercise) => exercise.key !== item.key);
      setData(newData);
      onDataChange?.(newData);
    };

    return (
      <View className="flex-1 flex-row items-center justify-end bg-destructive px-4">
        <TouchableOpacity
          className="flex-row items-center rounded-md"
          onPress={handleDelete}
          activeOpacity={0.5}>
          <Text>Delete</Text>
          <Icon as={Trash} />
        </TouchableOpacity>
      </View>
    );
  };

  const UnderlayRight = ({ item }: { item: ExerciseItem }) => {
    const { close } = useSwipeableItemParams<ExerciseItem>();

    const handleCopy = async () => {
      await close();
      const newItem: ExerciseItem = {
        ...item,
        key: `exercise-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      };
      const itemIndex = data.findIndex((exercise) => exercise.key === item.key);
      const newData = [...data.slice(0, itemIndex + 1), newItem, ...data.slice(itemIndex + 1)];
      setData(newData);
      onDataChange?.(newData);
    };

    return (
      <View className="flex-1 flex-row items-center justify-start bg-primary-foreground px-4">
        <TouchableOpacity
          className="flex-row items-center rounded-md"
          onPress={handleCopy}
          activeOpacity={0.5}>
          <Text>Copy</Text>
          <Icon as={Copy} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<ExerciseItem>) => {
    return (
      <ScaleDecorator>
        <SwipeableItem
          item={item}
          renderUnderlayLeft={() => <UnderlayLeft item={item} />}
          renderUnderlayRight={() => <UnderlayRight item={item} />}
          snapPointsLeft={[80]}
          snapPointsRight={[80]}
          activationThreshold={5}
          swipeEnabled={true}>
          <TouchableOpacity
            onLongPress={drag}
            disabled={isActive}
            activeOpacity={1}
            className="p-4">
            <Card
              className={`border-border/0 shadow-none ${isActive ? 'bg-destructive/10' : 'bg-card'}`}>
              <CardContent className="p-0">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-base font-semibold">{item.exerciseName}</Text>
                    <Text className="text-sm text-muted-foreground">
                      {item.amount} {item.categoryId === 1 ? 'reps' : 'secs'}
                    </Text>
                  </View>
                  <Text className="font-mono text-sm text-muted-foreground">Drag me</Text>
                </View>
              </CardContent>
            </Card>
          </TouchableOpacity>
        </SwipeableItem>
      </ScaleDecorator>
    );
  };

  return (
    <>
      <DraggableFlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        onDragEnd={handleDragEnd}
        className="px-2"
      />
    </>
  );
}
