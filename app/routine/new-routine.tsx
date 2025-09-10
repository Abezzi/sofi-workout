import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DraggableExerciseList } from '@/components/routine/draggable-exercise-list';
import { View } from 'react-native';
import { AddExerciseDialog } from '@/components/routine/add-exercise-dialog';

interface ExerciseItem {
  key: string;
  exerciseName: string;
  exerciseTypeId: number;
  categoryId: number;
  amount: string;
}

export default function NewRoutineScreen() {
  const navigation = useNavigation();
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [exercises, setExercises] = useState<ExerciseItem[]>([
    { key: '0', exerciseName: 'pull up', exerciseTypeId: 1, categoryId: 1, amount: '10' },
    { key: '1', exerciseName: 'chin up', exerciseTypeId: 1, categoryId: 1, amount: '10' },
    { key: '2', exerciseName: 'bench press', exerciseTypeId: 1, categoryId: 1, amount: '8' },
    { key: '3', exerciseName: 'hang hold', exerciseTypeId: 2, categoryId: 2, amount: '60' },
  ]);

  function changeNavigationTitle() {
    navigation.setOptions({ title: 'New Routine' });
  }

  function handleAddExercise() {
    setOpenDialog(true);
  }

  function handleConfirmDialog() {
    console.log('pressd confirm dialog');
    setOpenDialog(false);
  }

  function handleCancelDialog() {
    console.log('pressd cancel dialog');
    setOpenDialog(false);
  }

  function handleAddRest() { }

  useEffect(() => {
    changeNavigationTitle();
  }, [navigation]);

  return (
    <SafeAreaView>
      <AddExerciseDialog
        open={openDialog}
        onConfirm={handleConfirmDialog}
        onCancel={handleCancelDialog}
      />
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <View className="flex-row items-center justify-center">
            <Button onPress={handleAddExercise}>
              <Text>Add Exercise</Text>
            </Button>
            <Button
              onPress={handleAddRest}
              variant="outline"
              className="shadow shadow-foreground/5">
              <Text>Add Rest</Text>
            </Button>
          </View>
        </CardHeader>
        <CardContent>
          <DraggableExerciseList data={exercises} onDataChange={setExercises} />
        </CardContent>
      </Card>
    </SafeAreaView>
  );
}
