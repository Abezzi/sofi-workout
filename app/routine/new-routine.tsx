import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { DraggableExerciseList } from '@/components/routine/draggable-exercise-list';
import { View } from 'react-native';
import { AddExerciseDialog } from '@/components/routine/add-exercise-dialog';
import { Loader2, Save } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';

interface ExerciseItem {
  key: string;
  exerciseName: string;
  exerciseTypeId: number;
  categoryId: number;
  amount: {
    quantity: number;
    weight: number;
  }[];
}

export default function NewRoutineScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [exercises, setExercises] = useState<ExerciseItem[]>([
    {
      key: '0',
      exerciseName: 'pull up',
      exerciseTypeId: 1,
      categoryId: 1,
      amount: [
        { quantity: 101, weight: 123 },
        { quantity: 10, weight: 5 },
        { quantity: 10, weight: 5 },
        { quantity: 8, weight: 0 },
      ],
    },
    {
      key: '1',
      exerciseName: 'chin up',
      exerciseTypeId: 1,
      categoryId: 1,
      amount: [{ quantity: 10, weight: 5 }],
    },
    {
      key: '2',
      exerciseName: 'bench press',
      exerciseTypeId: 1,
      categoryId: 1,
      amount: [{ quantity: 10, weight: 5 }],
    },
    {
      key: '3',
      exerciseName: 'hang hold',
      exerciseTypeId: 2,
      categoryId: 2,
      amount: [{ quantity: 60, weight: 0 }],
    },
  ]);

  function changeNavigationTitle() {
    navigation.setOptions({ title: 'New Routine' });
  }

  function handleAddExercise() {
    setOpenDialog(true);
  }

  function handleSubmit() {
    setLoading(true);
    console.log('saving...');
  }

  function handleConfirmDialog(newExercise: ExerciseItem) {
    console.log('pressd confirm dialog');
    setExercises((prev) => [
      ...prev,
      {
        ...newExercise,
        key: `${prev.length}`,
      },
    ]);
    setOpenDialog(false);
    setOpenDialog(false);
  }

  function handleCancelDialog() {
    console.log('pressd cancel dialog');
    setOpenDialog(false);
  }

  function handleAddRest() {}

  useEffect(() => {
    changeNavigationTitle();
  }, [navigation]);

  return (
    <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
      <CardHeader>
        <View className="flex-row items-center justify-center">
          <Button onPress={handleAddExercise}>
            <Text>Add Exercise</Text>
          </Button>
          <Button onPress={handleAddRest} variant="outline" className="shadow shadow-foreground/5">
            <Text>Add Rest</Text>
          </Button>
        </View>
      </CardHeader>
      <CardContent>
        <DraggableExerciseList data={exercises} onDataChange={setExercises} />
      </CardContent>
      <CardFooter className="flex-col gap-3 pb-0">
        {loading ? (
          <Button disabled>
            <View className="pointer-events-none animate-spin">
              <Icon as={Loader2} className="text-primary-foreground" />
            </View>
            <Text>Saving...</Text>
          </Button>
        ) : (
          <Button onPress={handleSubmit}>
            <Icon as={Save} className="text-primary-foreground" />
            <Text>Save</Text>
          </Button>
        )}
      </CardFooter>
      <AddExerciseDialog
        open={openDialog}
        onConfirm={handleConfirmDialog}
        onCancel={handleCancelDialog}
      />
    </Card>
  );
}
