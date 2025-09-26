import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { DraggableExerciseList } from '@/components/routine/draggable-exercise-list';
import { Platform, View } from 'react-native';
import { AddExerciseDialog } from '@/components/routine/add-exercise-dialog';
import {
  ArrowLeft,
  ArrowRight,
  BadgeHelp,
  ChevronDown,
  ChevronUp,
  Circle,
  Ghost,
  Grip,
  Loader2,
  Save,
} from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Routine, RoutineExercise, ExerciseSet } from '@/db/schema';
import { postRoutine } from '@/db/queries/routine.queries';
import { postExerciseSet } from '@/db/queries/exercise_set.queries';
import { postRoutineExercise } from '@/db/queries/routine_exercise.queries';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ExerciseItem {
  key: string;
  exerciseTypeId: number;
  exercise: {
    id: number;
    name: string;
    description: string;
  };
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

export default function NewRoutineScreen() {
  const navigation = useNavigation();
  const [routineExercises, setRoutineExercises] = useState<RoutineExercise[]>([]);
  const [routine, setRoutine] = useState<Routine>({
    id: 0,
    name: '',
  });
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({
      ios: insets.bottom,
      android: insets.bottom + 24,
    }),
  };

  const [exercises, setExercises] = useState<ExerciseItem[]>([]);

  function changeNavigationTitle() {
    navigation.setOptions({
      title: 'New Routine',
      headerRight: () => (
        <HoverCard>
          <HoverCardTrigger>
            <Icon as={BadgeHelp} className="size-6" />
          </HoverCardTrigger>
          <HoverCardContent insets={contentInsets} className="w-64 p-4" side="top" align="end">
            <Text className="mb-2 text-base font-semibold">Actions over the list:</Text>
            <View className="flex-col gap-3">
              <View className="flex-row items-center gap-3">
                <Icon as={ArrowLeft} className="size-5" />
                <View className="flex-1">
                  <Text className="text-sm font-semibold">Delete</Text>
                  <Text className="text-sm text-muted-foreground">Swipe left to Delete</Text>
                </View>
              </View>
              <View className="flex-row items-center gap-3">
                <Icon as={ArrowRight} className="size-5" />
                <View className="flex-1">
                  <Text className="text-sm font-semibold">Copy</Text>
                  <Text className="text-sm text-muted-foreground">Swipe right to Copy</Text>
                </View>
              </View>
              <View className="flex-row items-center gap-3">
                <Icon as={Grip} className="size-5" />
                <View className="flex-1">
                  <Text className="text-sm font-semibold">Reorder</Text>
                  <Text className="text-sm text-muted-foreground">
                    Hold an exercise, then drag and drop
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center gap-3">
                <Icon as={ChevronDown} className="size-5" />
                <View className="flex-1">
                  <Text className="text-sm font-semibold">Unfold</Text>
                  <Text className="text-sm text-muted-foreground">Point the icon to unfold</Text>
                </View>
              </View>
              <View className="flex-row items-center gap-3">
                <Icon as={ChevronUp} className="size-5" />
                <View className="flex-1">
                  <Text className="text-sm font-semibold">Fold</Text>
                  <Text className="text-sm text-muted-foreground">Point the icon to fold</Text>
                </View>
              </View>
              <Text className="text-base font-semibold">Information:</Text>
              <View className="flex-row items-center gap-3">
                <Icon as={Circle} className="size-5" />
                <View className="flex-1">
                  <Text className="text-sm font-semibold">Category</Text>
                  <Text className="text-sm text-muted-foreground">
                    The color of the circle depends on the category
                  </Text>
                </View>
              </View>
            </View>
          </HoverCardContent>
        </HoverCard>
      ),
    });
  }

  function handleAddExercise() {
    setOpenDialog(true);
  }

  const handleInputChange = (field: keyof Routine, value: string) => {
    setRoutine((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  async function handleSubmit() {
    setLoading(true);
    const routineId = await saveRoutine();
    if (routineId) {
      const routineExerciseIds = await saveRoutineExercise(routineId);
      if (routineExerciseIds) {
        await saveExerciseSet(routineExerciseIds);
      }
    }
    setLoading(false);
  }

  function handleConfirmDialog(newExercise: ExerciseItem) {
    setExercises((prev) => [
      ...prev,
      {
        ...newExercise,
        key: `${prev.length}`,
      },
    ]);
    setOpenDialog(false);
  }

  function handleCancelDialog() {
    setOpenDialog(false);
  }

  function handleAddRest() {}

  useEffect(() => {
    changeNavigationTitle();
  }, [navigation]);

  const saveRoutine = async () => {
    if (routine) {
      const response = await postRoutine(routine);
      if (response.success) {
        console.log('Routine Created Successfully');
        return response.id;
      } else {
        console.log('ERROR: ');
      }
    } else {
      console.log('routine does not exists');
    }
  };

  const saveRoutineExercise = async (routineId: number) => {
    try {
      const newRoutineExercises = exercises.map((exercise, index) => ({
        id: 0,
        routineId: routineId,
        exerciseId: exercise.exercise.id,
        position: index + 1, // TODO: check if the +1 is needed or not in the DB
      }));

      const savedRoutineExerciseIds: { position: number; id: number }[] = [];

      for (const routineExercise of newRoutineExercises) {
        const response = await postRoutineExercise(routineExercise);
        if (response.success && response.id) {
          console.log(
            `routineExercise saved successfully: exerciseId=${routineExercise.exerciseId}, position=${routineExercise.position}, id=${response.id}`
          );
          savedRoutineExerciseIds.push({ position: routineExercise.position, id: response.id });
        } else {
          console.error('error saving RoutineExercise');
          return null;
        }
      }
      setRoutineExercises(newRoutineExercises);
      return savedRoutineExerciseIds;
    } catch (error) {
      console.log('error (catch) in save routine exercise: ', error);
      return null;
    }
  };

  const saveExerciseSet = async (routineExerciseIds: { position: number; id: number }[]) => {
    try {
      for (const exercise of exercises) {
        const routineExercise = routineExerciseIds.find(
          (re) => re.position === exercises.indexOf(exercise) + 1
        );
        if (!routineExercise) {
          console.error(
            `no RoutineExercise id found for exercise at position ${exercises.indexOf(exercise) + 1}`
          );
          continue;
        }

        const exerciseSets: ExerciseSet[] = exercise.amount.map((set, index) => ({
          id: 0,
          routineExerciseId: routineExercise.id,
          setNumber: index + 1,
          quantity: set.quantity,
          weight: set.weight,
        }));

        for (const exerciseSet of exerciseSets) {
          const response = await postExerciseSet(exerciseSet);
          if (response.success) {
            console.log(
              `exerciseSet saved successfully: routineExerciseId=${exerciseSet.routineExerciseId}, setNumber=${exerciseSet.setNumber}`
            );
          } else {
            console.error('error saving ExerciseSet');
          }
        }
      }
    } catch (error) {
      console.error('error in saveExerciseSet:', error);
    }
  };

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
        <View className="px-4 pb-4">
          <Input
            placeholder="Routine Name..."
            id="routineName"
            autoCapitalize="none"
            value={routine.name}
            onChangeText={(routineName) => handleInputChange('name', routineName)}
          />
        </View>
        {exercises.length > 0 ? (
          <DraggableExerciseList data={exercises} onDataChange={setExercises} />
        ) : (
          <View className="items-center">
            <Text className="font-semibold">Your exercise list is empty</Text>
            <Text className="text-sm text-muted-foreground">
              add some by pressing 'Add Exercise'
            </Text>
            <Icon as={Ghost} className="size-8" />
          </View>
        )}
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
