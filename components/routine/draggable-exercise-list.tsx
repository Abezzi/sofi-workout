import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';

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

  const renderItem = ({ item, drag, isActive }: RenderItemParams<ExerciseItem>) => {
    return (
      <ScaleDecorator>
        <TouchableOpacity onLongPress={drag} disabled={isActive} activeOpacity={1} className="p-4">
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
