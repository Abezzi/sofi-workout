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
import { ChevronDown, ChevronUp, Copy, Grip, Trash } from 'lucide-react-native';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Input } from '../ui/input';

interface ExerciseItem {
  key: string;
  exerciseName: string;
  exerciseTypeId: number;
  category: {
    id: number;
    name: string;
    color: string;
  };
  amount: {
    quantity: number;
    weight: number;
  }[];
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

  const handleWeightChange = (key: string, value: string, setIndex: number) => {
    const newData = data.map((item) => {
      if (item.key === key) {
        const newAmount = [...item.amount];
        newAmount[setIndex] = {
          ...newAmount[setIndex],
          weight: value ? parseFloat(value) : 0,
        };
        return { ...item, amount: newAmount };
      }
      return item;
    });
    setData(newData);
    onDataChange?.(newData);
  };

  const handleQuantityChange = (key: string, value: string, setIndex: number) => {
    const newData = data.map((item) => {
      if (item.key === key) {
        const newAmount = [...item.amount];
        newAmount[setIndex] = {
          ...newAmount[setIndex],
          quantity: value ? parseInt(value) : 0,
        };
        return { ...item, amount: newAmount };
      }
      return item;
    });
    setData(newData);
    onDataChange?.(newData);
  };

  // Swipe to the left to delete
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

  // Swipe to the right to copy
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
    const [isOpen, setIsOpen] = useState(false);
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
            // space between the cards
            className="pb-1">
            <Card
              // border-border/0
              className={`shadow-none ${isActive ? 'bg-destructive/10' : 'bg-card'}`}>
              <CardContent className="mx-1">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Collapsible open={isOpen} onOpenChange={setIsOpen} defaultOpen={false}>
                      <CollapsibleTrigger className="flex-row">
                        <Text className="text-base font-semibold">
                          <Text style={{ color: item.category.color }}>● </Text>
                          {item.exerciseName}
                          <Icon as={isOpen ? ChevronUp : ChevronDown} />
                        </Text>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        {item.amount.map((set, index) => (
                          <View key={index} className="flex-row align-middle">
                            <View className="flex-none justify-center">
                              <Text className="text-sm text-muted-foreground">{index + 1}.</Text>
                            </View>
                            <View className="flex-1 flex-row items-center justify-center">
                              <Input
                                keyboardType="numeric"
                                className="w-16"
                                value={set.quantity.toString()}
                                selectTextOnFocus={true}
                                onChangeText={(value) =>
                                  handleQuantityChange(item.key, value, index)
                                }
                              />
                              <Text className="ml-1 text-sm text-muted-foreground">
                                {item.exerciseTypeId === 1 ? 'reps' : 'secs'}
                              </Text>
                            </View>
                            <View className="flex-1 flex-row items-center justify-center">
                              <Input
                                keyboardType="numeric"
                                className="w-16"
                                value={set.weight.toString()}
                                selectTextOnFocus={true}
                                onChangeText={(value) => handleWeightChange(item.key, value, index)}
                              />
                              <Text className="ml-1 text-sm text-muted-foreground">
                                {/* {set.weight > 0 ? 'kg' : ''} */}
                                kg
                              </Text>
                            </View>
                          </View>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  </View>
                  <Icon as={Grip} className="size-4" />
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
