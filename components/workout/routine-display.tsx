import { useSelector } from 'react-redux';
import { RootState } from '@/src/store/storeSetup';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatTimeShort } from '@/utils/format-time';
import { memo, useEffect, useRef } from 'react';
import { Step } from '@/types/workout';

interface StepItemProps {
  step: Step;
  isCurrent: boolean;
  isCompleted: boolean;
}

const StepItem = memo(({ step, isCurrent, isCompleted }: StepItemProps) => {
  return (
    <View
      className={`mb-2 rounded-lg p-3 ${isCurrent
          ? 'border-2 border-primary bg-gray-100 dark:border-primary dark:bg-primary-foreground'
          : isCompleted
            ? 'border-2 border-green-500 bg-green-100 dark:bg-green-900'
            : 'bg-gray-100 dark:bg-primary-foreground'
        }`}>
      <Text
        className={`text-base ${isCurrent
            ? 'font-semibold'
            : isCompleted
              ? 'font-semibold text-green-700 dark:text-white'
              : 'text-gray-700 dark:text-white'
          }`}>
        {step.name} {step.automatic ? '(' + formatTimeShort(step.quantity) + ')' : ''}
      </Text>
      <Text
        className={`text-sm ${isCurrent ? 'font-semibold' : 'text-gray-500 dark:text-gray-200'}`}>
        {step.isRest ? 'Rest' : 'Work'}
      </Text>
    </View>
  );
});

const RoutineDisplay = () => {
  const { steps, currentStep } = useSelector((state: RootState) => state.timer);
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const getItemLayout = (_: any, index: number) => ({
    // height of each item (adjust based on actual height)
    length: 73.14,
    offset: 84.5 * index,
    index,
  });

  useEffect(() => {
    if (flatListRef.current && steps.length > 0) {
      const currentIndex = steps.findIndex((step) => step.step === currentStep);
      if (currentIndex !== -1) {
        flatListRef.current.scrollToIndex({
          index: currentIndex,
          animated: true,
          // 0 top, 0.5 center, 1 bottom
          viewPosition: 0,
        });
      }
    }
  }, [currentStep, steps]);

  return (
    <Card className="rounder-2xl w-full max-w-sm">
      {/*
      <CardHeader className="items-center">
        <Text className="text-gray text-lg font-bold outline dark:text-white">Routine</Text>
      </CardHeader>
      */}
      <CardContent>
        {steps.length > 0 ? (
          <FlatList
            ref={flatListRef}
            data={steps}
            renderItem={({ item }) => (
              <StepItem
                step={item}
                isCurrent={item.step === currentStep}
                isCompleted={item.step < currentStep}
              />
            )}
            keyExtractor={(item) => item.step.toString()}
            contentContainerStyle={{
              paddingBottom: insets.bottom + 40,
              paddingHorizontal: 10,
            }}
            showsVerticalScrollIndicator={true}
            getItemLayout={getItemLayout}
            // how many initial visible items will render
            initialNumToRender={10}
            // batch render
            maxToRenderPerBatch={10}
            // how much screen worth of items will render
            windowSize={5}
            // TODO: calculate maxHeight
            style={{ maxHeight: 250 }}
            onScrollToIndexFailed={(info) => {
              // fallback in case scrollToIndex fails when item not yet rendered
              setTimeout(() => {
                flatListRef.current?.scrollToIndex({
                  index: info.index,
                  animated: true,
                  viewPosition: 0,
                });
              }, 100);
            }}
          />
        ) : (
          <Text className="text-gray-500">No steps available</Text>
        )}
      </CardContent>
    </Card>
  );
};

export default RoutineDisplay;
