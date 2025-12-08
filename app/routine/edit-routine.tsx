import FullScreenLoader from '@/components/base/full-screen-loader';
import { DraggableExerciseList } from '@/components/routine/draggable-exercise-list';
import { RoutineModeChangeDialog } from '@/components/routine/routine-mode-change-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import {
  getRoutineWithExerciseAndRest,
  updateRoutineName,
  saveRoutineExercisesAndRest,
  RoutineWithExerciseAndRest,
} from '@/db/queries/routine.queries';
import { ExerciseItem } from '@/types/workout';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { Save, X } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ToastAndroid, View } from 'react-native';

export default function EditRoutineScreen() {
  const { selectedRoutine } = useLocalSearchParams() as { selectedRoutine: string };
  const routineId = parseInt(selectedRoutine, 10);

  const [routine, setRoutine] = useState<RoutineWithExerciseAndRest | null>(null);
  const [name, setName] = useState('');
  const [manualRestCheck, setManualRestCheck] = useState<boolean>(false);
  const [items, setItems] = useState<ExerciseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [manualRest, setManualRest] = useState<string>('60');
  const [restBetweenExercise, setRestBetweenExercise] = useState('0');
  const [setRest, setSetRest] = useState('0');
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [modeChangeDialogOpen, setModeChangeDialogOpen] = useState<boolean>(false);

  const sendToast = (message: string) => {
    ToastAndroid.showWithGravity(message, ToastAndroid.SHORT, ToastAndroid.CENTER);
  };

  const onCheckedChange = () => {
    setModeChangeDialogOpen(true);
  };

  useEffect(() => {
    navigation.setOptions({ title: t('home_screen.edit_routine') });
  }, []);

  // load the rest timers for the input fields of automatic mode
  useEffect(() => {
    if (!manualRestCheck && routine) {
      const setTimer = routine.restTimers.find((rt) => rt.type === 'set');
      const exerciseTimer = routine.restTimers.find((rt) => rt.type === 'exercise');

      setSetRest((setTimer?.restTime ?? 60).toString());
      setRestBetweenExercise((exerciseTimer?.restTime ?? 120).toString());
    }
  }, [manualRestCheck, routine]);

  useEffect(() => {
    if (!routineId) return;

    setLoading(true);
    getRoutineWithExerciseAndRest(routineId)
      .then((data) => {
        if (!data) return;
        setRoutine(data);
        setName(data.name);
        setManualRestCheck(data.restMode === 'manual'); // manual 1

        const loaded: ExerciseItem[] = [];

        data.exercises.forEach((ex: any) => {
          const isRest = ex.exerciseId === null || ex.name.startsWith('Rest');
          const key = isRest ? `rest-${ex.id || Date.now()}` : `exercise-${ex.id}`;
          const restSeconds = isRest ? (ex.sets[0]?.quantity ?? 60) : undefined;
          const item: ExerciseItem = {
            key,
            isRest,
            restSeconds,
            exerciseTypeId: ex.exerciseType?.id ?? 1,
            position: ex.position,
            exercise: {
              id: ex.exerciseId ?? (isRest ? 0 : -1),
              name: ex.name,
              description: ex.description ?? '',
            },
            category: ex.category ?? { id: 0, name: 'Rest', color: '#94a3b8' },
            amount:
              ex.sets?.map((s: any) => ({
                quantity: s.quantity ?? s.reps ?? (isRest ? restSeconds : 0),
                weight: s.weight ?? 0,
              })) ?? (isRest ? [{ quantity: restSeconds, weight: 0 }] : []),
          };

          loaded.push(item);
        });

        // sort by position (just in case)
        loaded.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

        setItems(loaded);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [routineId]);

  const handleCancel = () => {
    setModeChangeDialogOpen(false);
  };

  const handleTransformRoutineMode = () => {
    if (!routine || items.length === 0) return;

    const newItems: ExerciseItem[] = [];
    const setRestSeconds = parseInt(setRest, 10) || 60;
    const exerciseRestSeconds = parseInt(restBetweenExercise, 10) || 120;
    let positionCounter = 1;

    // MANUAL TO AUTOMATIC
    if (manualRestCheck) {
      // collapse split sets back into single exercise blocks with multiple sets
      const exerciseMap = new Map<string, ExerciseItem>();

      items.forEach((item) => {
        if (item.isRest) return;

        const baseKey = item.exercise.id > 0 ? `exercise-${item.exercise.id}` : item.key;
        const existing = exerciseMap.get(baseKey);

        if (existing) {
          // merge sets
          existing.amount = [...existing.amount, ...item.amount];
        } else {
          // first time seeing this exercise
          exerciseMap.set(baseKey, {
            ...item,
            key: baseKey.includes('exercise-')
              ? baseKey
              : `exercise-${item.exercise.id}-${Date.now()}`,
            amount: [...item.amount],
            // will be reassigned later
            position: positionCounter++,
          });
        }
      });

      // reassign positions in order
      exerciseMap.forEach((exercise) => {
        exercise.position = positionCounter++;
        newItems.push(exercise);
      });

      // suggest a reasonable default rest time (last used manual rest or fallback)
      const lastRestBlock = items
        .slice()
        .reverse()
        .find((i) => i.isRest);
      const suggestedRest = lastRestBlock
        ? (lastRestBlock.restSeconds ?? lastRestBlock.amount[0]?.quantity ?? 60)
        : setRestSeconds;

      setSetRest(suggestedRest.toString());
      setRestBetweenExercise(suggestedRest.toString());
    } else {
      // AUTOMATIC TO MANUAL
      items.forEach((exerciseItem, exerciseIndex) => {
        if (exerciseItem.isRest) return;

        const sets = exerciseItem.amount || [];
        const isLastExercise = exerciseIndex === items.length - 1;

        sets.forEach((set, setIndex) => {
          const isLastSetInExercise = setIndex === sets.length - 1;

          // add the single-set exercise block
          const singleSetExercise: ExerciseItem = {
            ...exerciseItem,
            key: `exercise-${exerciseItem.key}-set-${setIndex}-${Date.now()}`,
            amount: [set],
            position: positionCounter++,
          };
          newItems.push(singleSetExercise);

          // decide which rest to insert no rest after very last set
          const shouldInsertRest = !(isLastExercise && isLastSetInExercise);

          if (shouldInsertRest) {
            const restTime =
              isLastSetInExercise && !isLastExercise
                ? // between exercises -> use exercise rest
                  exerciseRestSeconds
                : // between sets of same exercise -> use set rest
                  setRestSeconds;

            if (restTime > 0) {
              const restItem: ExerciseItem = {
                key: `rest-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                isRest: true,
                restSeconds: restTime,
                exerciseTypeId: 1,
                position: positionCounter++,
                exercise: {
                  id: 0,
                  name: 'Rest',
                  description: '',
                },
                category: { id: 0, name: 'Rest', color: '#94a3b8' },
                amount: [{ quantity: restTime, weight: 0 }],
              };
              newItems.push(restItem);
            }
          }
        });
      });
    }

    // assign new items
    setItems(newItems);
    // change check
    setManualRestCheck(!manualRestCheck);
    // close dialog
    setModeChangeDialogOpen(false);
    // send toast
    sendToast(`Switched to ${!manualRestCheck ? 'Manual' : 'Automatic'} Rest Mode`);
  };

  const handleSubmit = useCallback(async () => {
    if (!routine || saving) return;

    setSaving(true);
    try {
      if (name.trim() !== routine.name) {
        await updateRoutineName(routineId, name.trim());
      }

      const sr = parseInt(setRest, 10) || 0;
      const rbe = parseInt(restBetweenExercise, 10) || 0;

      await saveRoutineExercisesAndRest(routineId, items, sr, rbe);
      router.push({ pathname: '/home' });

      sendToast('Routine updated Successfully');
    } catch (err: any) {
      sendToast('ERROR!');
    } finally {
      setSaving(false);
    }
  }, [routine, name, items, saving, routineId, manualRestCheck, setRest, restBetweenExercise]);

  // add rest timers
  const addRest = () => {
    const newRest: ExerciseItem = {
      key: `rest-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      isRest: true,
      restSeconds: 60,
      exerciseTypeId: 1,
      exercise: { id: 0, name: 'Rest', description: '' },
      category: { id: 0, name: 'Rest', color: '#94a3b8' },
      amount: [{ quantity: 60, weight: 0 }],
    };
    setItems([...items, newRest]);
  };

  if (loading) return <FullScreenLoader visible message="Loading routine..." />;

  if (!routine) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text>Routine not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardContent>
          <View className="px-2 pb-4">
            <View>
              <Label>Routine Name:</Label>
              <Input
                value={name}
                onChangeText={setName}
                placeholder="Routine name"
                className="text-2xl font-bold"
              />
            </View>

            <View className="mt-2 flex-row gap-2">
              {/* column 1*/}
              <View className="flex-1 items-center justify-center">
                <Label className="mb-2">Rest Mode:</Label>
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
                      onPress={addRest}
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
          {items.length > 0 ? (
            <DraggableExerciseList data={items} onDataChange={setItems} />
          ) : (
            <Text className="text-center text-muted-foreground">No exercises yet</Text>
          )}

          {/*
          <Button variant="outline" onPress={addRest} className="mt-2">
            <Icon as={Plus} className="mr-2" />
            <Text>Add Rest Block</Text>
          </Button>
          */}
        </CardContent>

        <CardFooter className="justify-center">
          <Button onPress={handleSubmit}>
            <Icon as={Save} className="text-primary-foreground" />
            <Text>Save</Text>
          </Button>
          <Button onPress={handleCancel} variant="outline">
            <Icon as={X} />
            <Text>Discard</Text>
          </Button>
        </CardFooter>
      </Card>

      <FullScreenLoader visible={saving} message="Saving routine..." />
      {modeChangeDialogOpen && (
        <RoutineModeChangeDialog
          open={modeChangeDialogOpen}
          onConfirm={handleTransformRoutineMode}
          onCancel={handleCancel}
        />
      )}
    </View>
  );
}
