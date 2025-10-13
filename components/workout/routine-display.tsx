import { useSelector } from 'react-redux';
import { RootState } from '@/src/store/storeSetup';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatTimeShort } from '@/utils/format-time';
import { memo } from 'react';
import { Step } from '@/types/workout';

interface StepItemProps {
  step: Step;
  isCurrent: boolean;
}

const StepItem = memo(({ step, isCurrent }: StepItemProps) => {
  return (
    <View
      className={`mb-2 rounded-lg p-3 ${
        isCurrent ? 'border-2 border-blue-500 bg-blue-100' : 'bg-gray-100'
      }`}>
      <Text className={`text-base ${isCurrent ? 'font-semibold text-blue-700' : 'text-gray-700'}`}>
        {step.name} {step.automatic ? '(' + formatTimeShort(step.quantity) + ')' : ''}
      </Text>
      <Text className={`text-sm ${isCurrent ? 'text-blue-600' : 'text-gray-500'}`}>
        {step.isRest ? 'Rest' : 'Work'}
      </Text>
    </View>
  );
});

const RoutineDisplay = () => {
  const { steps, currentStep } = useSelector((state: RootState) => state.timer);
  const insets = useSafeAreaInsets();

  const getItemLayout = (_: any, index: number) => ({
    // height of each item (adjust based on actual height)
    length: 80,
    offset: 70 * index,
    index,
  });

  return (
    <Card className="rounder-2xl w-full max-w-sm">
      <CardHeader className="items-center">
        <Text className="text-lg font-bold">Routine</Text>
      </CardHeader>
      <CardContent>
        {steps.length > 0 ? (
          <FlatList
            data={steps}
            renderItem={({ item }) => (
              <StepItem step={item} isCurrent={item.step === currentStep} />
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
            style={{ maxHeight: 300 }}
          />
        ) : (
          <Text className="text-gray-500">No steps available</Text>
        )}
      </CardContent>
    </Card>
  );
};

export default RoutineDisplay;
