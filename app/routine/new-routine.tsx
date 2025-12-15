import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useNavigation, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { DraggableExerciseList } from '@/components/routine/draggable-exercise-list';
import { Alert, Keyboard, Platform, View } from 'react-native';
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
import { Routine } from '@/db/schema';
import { saveFullRoutine } from '@/db/queries/routine.queries';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import FullScreenLoader from '@/components/base/full-screen-loader';
import { ExerciseItem } from '@/types/workout';

interface Errors {
  routineName: string;
  exercises: string;
}

export default function NewRoutineScreen() {
  const navigation = useNavigation();
  const [routine, setRoutine] = useState<Routine>({
    id: 0,
    name: '',
    description: '',
    restMode: 'automatic',
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
  const [setRest, setSetRest] = useState('0');
  const [restBetweenExercise, setRestBetweenExercise] = useState('0');
  const [manualRestCheck, setManualRestCheck] = useState<boolean>(false);
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [errors, setErrors] = useState<Errors>();
  const [isFormValid, setIsFormValid] = useState(false);
  const [manualRest, setManualRest] = useState<string>('60');
  const router = useRouter();

  const errorsAlert = () => {
    if (!errors) return;

    // explicit typing
    const filteredErrors = Object.values(errors).filter((error: string) => error !== '');

    if (filteredErrors.length === 0) return;

    Alert.alert(
      'Invalid Fields',
      `Should complete all the required fields:\n${filteredErrors
        .map((error) => `- ${error}`)
        .join('\n')}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
        },
      ]
    );
  };

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

  const onCheckedChange = (checked: boolean) => {
    setManualRestCheck(checked);
    setRoutine({
      id: routine.id,
      description: routine.description,
      name: routine.name,
      restMode: checked ? 'manual' : 'automatic',
    });
  };

  function handleAddExercise() {
    Keyboard.dismiss();
    setOpenDialog(true);
  }

  const handleInputChange = (field: keyof Routine, value: string | boolean) => {
    setRoutine((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!isFormValid) {
      errorsAlert();
      return;
    }
    setLoading(true);
    await new Promise(requestAnimationFrame);
    try {
      const result = await saveFullRoutine({
        routine: {
          name: routine.name,
          description: routine.description ?? '',
          restMode: manualRestCheck ? 'manual' : 'automatic',
        },
        exercises: exercises.map((ex, idx) => ({
          exerciseId: ex.isRest ? null : ex.exercise.id,
          position: idx + 1,
          sets: ex.isRest
            ? [{ quantity: ex.restSeconds || 60, weight: 0 }]
            : ex.amount.map((a) => ({ quantity: a.quantity, weight: a.weight })),
        })),
        restMode: manualRestCheck ? 'manual' : 'automatic',
        setRest: manualRestCheck ? undefined : parseInt(setRest) || 0,
        restBetweenExercise: manualRestCheck ? undefined : parseInt(restBetweenExercise) || 0,
      });

      if (result.success) {
        router.push('/(tabs)/home');
      } else {
        Alert.alert('Error', result.error?.message ?? 'Failed to save routine');
      }
    } catch (error) {
      console.log('error submiting the routine');
      Alert.alert('Error', 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  function handleConfirmDialog(newExercise: ExerciseItem) {
    setExercises((prev) => [
      ...prev,
      {
        ...newExercise,
        key: `exercise-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      },
    ]);
    setOpenDialog(false);
  }

  function handleCancelDialog() {
    setOpenDialog(false);
  }

  function handleAddRest() {
    const restSeconds = parseInt(manualRest) || 60;
    const newRestItem: ExerciseItem = {
      key: `rest-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      isRest: true,
      restSeconds,
      exerciseTypeId: 2,
      exercise: {
        id: -1,
        name: `Rest`,
        description: 'Rest period',
      },
      category: {
        id: -1,
        name: 'Rest',
        color: '#94a3b8', // slate-400
      },
      amount: [{ quantity: restSeconds, weight: 0 }],
    };

    setExercises((prev) => [...prev, newRestItem]);
  }

  useEffect(() => {
    changeNavigationTitle();
  }, [navigation]);

  useEffect(() => {
    validateForm();
  }, [routine.name, exercises]);

  const validateForm = () => {
    let errors: Errors = { routineName: '', exercises: '' };

    if (!routine.name) {
      errors.routineName = 'Routine name is required';
    }

    if (!exercises || exercises.length === 0) {
      errors.exercises = 'Add at least one exercise before saving';
    }

    setErrors(errors);
    setIsFormValid(Object.values(errors).every((error) => error === ''));
  };

  return (
    <View className="flex-1">
      <Card className="border-border/0 pt-2 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardContent>
          <View>
            <View className="px-2 pb-4">
              {/*row 1*/}
              <View className="flex flex-row gap-2 p-2 align-middle">
                {/* Routine name */}
                <View className="w-2/3">
                  <Label>Routine Name</Label>
                  <Input
                    placeholder="My Favorite Routine"
                    id="routineName"
                    value={routine.name}
                    onChangeText={(routineName) => handleInputChange('name', routineName)}
                    className={`${errors && errors.routineName ? 'border border-red-500' : ''}`}
                  />
                </View>
                {/* Add exercise button */}
                <View className="flex w-1/3 justify-end">
                  <Button onPress={handleAddExercise} className="items-center" variant="outline">
                    <Text>Add</Text>
                  </Button>
                </View>
              </View>

              {/* row 2*/}
              <View className="flex flex-row gap-2 p-2 align-middle">
                <View className="w-full">
                  <Label>Description</Label>
                  <Input
                    placeholder="This will make you stronger"
                    id="description"
                    value={routine.description ? routine.description : undefined}
                    onChangeText={(routineDescription) =>
                      handleInputChange('description', routineDescription)
                    }
                  />
                </View>
              </View>

              {/*row 2*/}
              <View className="mt-2 flex-row gap-2">
                {/*column 1*/}
                <View className="flex-1 items-center justify-center">
                  <Label nativeID="manualRestCheck" htmlFor="manualRestCheck" className="mb-2">
                    Rest Mode
                  </Label>
                  <Switch
                    id="manualRestCheck"
                    nativeID="manualRestCheck"
                    checked={manualRestCheck}
                    onCheckedChange={onCheckedChange}
                  />
                  <Label className="mt-2 text-sm">{manualRestCheck ? 'MANUAL' : 'AUTOMATIC'}</Label>
                </View>

                {manualRestCheck ? (
                  <>
                    {/* column 2 */}
                    <View className="flex-1 justify-center">
                      <Button
                        onPress={handleAddRest}
                        variant="outline"
                        className="w-full shadow shadow-foreground/5">
                        <Text>Add Rest</Text>
                      </Button>
                    </View>

                    {/* column 3 */}
                    <View className="flex-1 justify-center">
                      <Input
                        placeholder="180"
                        value={manualRest}
                        onChangeText={setManualRest}
                        keyboardType="numeric"
                        selectTextOnFocus={true}
                        className="h-12"
                      />
                    </View>
                  </>
                ) : (
                  <>
                    {/* column 2 */}
                    <View className="flex-1">
                      <Label nativeID="setRest" className="mb-1 text-sm">
                        Set Rest
                      </Label>
                      <Input
                        aria-labelledby="setRest"
                        value={setRest}
                        onChangeText={setSetRest}
                        keyboardType="numeric"
                        selectTextOnFocus={true}
                        className="h-12"
                      />
                    </View>

                    {/* column 3 */}
                    <View className="flex-1">
                      <Label nativeID="restBetweenExercise" className="mb-1 text-sm">
                        Exercises Rest
                      </Label>
                      <Input
                        aria-labelledby="restBetweenExercise"
                        value={restBetweenExercise}
                        onChangeText={setRestBetweenExercise}
                        keyboardType="numeric"
                        selectTextOnFocus={true}
                        className="h-12"
                      />
                    </View>
                  </>
                )}
              </View>
            </View>
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
            <Button disabled={loading} onPress={handleSubmit}>
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
      <FullScreenLoader visible={loading} />
    </View>
  );
}
