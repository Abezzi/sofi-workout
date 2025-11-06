import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useCallback, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import SwipeableItem, { useSwipeableItemParams } from 'react-native-swipeable-item';
import { Icon } from '../ui/icon';
import { ChevronDown, ChevronUp, Copy, Grip, Timer, Trash } from 'lucide-react-native';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Input } from '../ui/input';
import { ExerciseItem } from '@/types/workout';
import { useTranslation } from 'react-i18next';
import FullScreenLoader, { FullScreenLoaderType } from '../base/full-screen-loader';

interface DraggableExerciseListProps {
  data: ExerciseItem[];
  onDataChange?: (newData: ExerciseItem[]) => void;
}

export function DraggableExerciseList({ data, onDataChange }: DraggableExerciseListProps) {
  const { t } = useTranslation();
  const [fullScreenLoader, setFullScreenLoader] = useState<FullScreenLoaderType>({
    visible: false,
    message: 'Loading...',
  });
  const handleDragEnd = ({ data: newData }: { data: ExerciseItem[] }) => {
    onDataChange?.(newData);
  };

  const updateData = (newData: ExerciseItem[]) => {
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
    updateData(newData);
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
    updateData(newData);
  };

  // swipe to the left to delete
  const renderUnderlayLeft = useCallback(
    ({ item }: { item: ExerciseItem }) => {
      return (
        <View className="flex-1 flex-row items-center justify-end bg-destructive px-4">
          <TouchableOpacity
            className="flex-row items-center gap-2 rounded-md bg-destructive px-3 py-2"
            onPress={async () => {
              setFullScreenLoader({ visible: true, message: t('deleting') });
              await new Promise(requestAnimationFrame);
              const newData = data.filter((ex) => ex.key !== item.key);
              updateData(newData);
              setFullScreenLoader({ visible: false, message: 'Deleting...' });
            }}
            activeOpacity={0.7}>
            <Icon as={Trash} className="text-destructive-foreground" size={18} />
            <Text className="font-medium text-destructive-foreground">Delete</Text>
          </TouchableOpacity>
        </View>
      );
    },
    [data, updateData, t]
  );

  // Swipe to the right to copy
  const renderUnderlayRight = useCallback(
    ({ item }: { item: ExerciseItem }) => {
      return (
        <View className="flex-1 flex-row items-center justify-start bg-primary px-4">
          <TouchableOpacity
            className="flex-row items-center gap-2 rounded-md bg-primary px-3 py-2"
            onPress={async () => {
              setFullScreenLoader({ visible: true, message: t('copying') });
              await new Promise(requestAnimationFrame);

              const newItem: ExerciseItem = {
                ...item,
                key: `${item.isRest ? 'rest' : 'exercise'}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                exercise: item.isRest
                  ? { ...item.exercise!, name: `Rest ${item.restSeconds}s` }
                  : { ...item.exercise! },
              };

              const index = data.findIndex((ex) => ex.key === item.key);
              const newData = [...data.slice(0, index + 1), newItem, ...data.slice(index + 1)];

              updateData(newData);
              setFullScreenLoader({ visible: false, message: 'Copying...' });
            }}
            activeOpacity={0.7}>
            <Icon as={Copy} className="text-primary-foreground" size={18} />
            <Text className="font-medium text-primary-foreground">Copy</Text>
          </TouchableOpacity>
        </View>
      );
    },
    [data, updateData, t]
  );

  const renderItem = ({ item, drag, isActive }: RenderItemParams<ExerciseItem>) => {
    const [isOpen, setIsOpen] = useState(false);

    if (item.isRest) {
      return (
        <ScaleDecorator>
          <SwipeableItem
            item={item}
            renderUnderlayLeft={() => renderUnderlayLeft({ item })}
            renderUnderlayRight={() => renderUnderlayRight({ item })}
            snapPointsLeft={[80]}
            snapPointsRight={[80]}
            activationThreshold={5}
            swipeEnabled={true}>
            <TouchableOpacity
              onLongPress={drag}
              disabled={isActive}
              activeOpacity={1}
              className="pb-1">
              <Card className={`shadow-none ${isActive ? 'bg-destructive/10' : 'bg-card'} `}>
                <CardContent className="mx-1">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 flex-row items-center gap-3">
                      <Icon as={Timer} className="size-6" />
                      <Text className="text-base font-semibold">
                        {item.exercise?.name || 'Rest'}
                      </Text>
                      <Input
                        className="w-20"
                        keyboardType="numeric"
                        value={(item.restSeconds || 0).toString()}
                        onChangeText={(val) => {
                          const seconds = parseInt(val) || 0;
                          const newData = data.map((rest_item) =>
                            rest_item.key === item.key
                              ? {
                                ...rest_item,
                                restSeconds: seconds,
                                exercise: { ...rest_item.exercise!, name: 'Rest' },
                                amount: [{ quantity: seconds, weight: 0 }],
                              }
                              : rest_item
                          );
                          updateData(newData);
                        }}
                      />
                      <Text className="text-base font-semibold">{t('time.seconds')}</Text>
                    </View>
                    <Icon as={Grip} className="size-4" />
                  </View>
                </CardContent>
              </Card>
            </TouchableOpacity>
          </SwipeableItem>
        </ScaleDecorator>
      );
    }

    return (
      <ScaleDecorator>
        <SwipeableItem
          item={item}
          renderUnderlayLeft={() => renderUnderlayLeft({ item })}
          renderUnderlayRight={() => renderUnderlayRight({ item })}
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
                          {item.exercise.name}
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
        initialNumToRender={10}
        showsVerticalScrollIndicator={true}
        style={{ maxHeight: 320 }}
      />
      <FullScreenLoader visible={fullScreenLoader.visible} message={fullScreenLoader.message} />
    </>
  );
}
