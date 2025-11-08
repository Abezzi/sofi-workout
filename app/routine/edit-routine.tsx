import FullScreenLoader from '@/components/base/full-screen-loader';
import { DraggableExerciseList } from '@/components/routine/draggable-exercise-list';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import {
  getRoutineWithExerciseAndRest,
  updateRoutineName,
  saveRoutineExercisesAndRest,
  RoutineWithExerciseAndRest,
} from '@/db/queries/routine.queries';
import { ExerciseItem } from '@/types/workout';
import { useLocalSearchParams } from 'expo-router';
import { Loader2, Plus, Save } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';

export default function EditRoutineScreen() {
  const { selectedRoutine } = useLocalSearchParams() as { selectedRoutine: string };
  const routineId = parseInt(selectedRoutine, 10);

  const [routine, setRoutine] = useState<RoutineWithExerciseAndRest | null>(null);
  const [name, setName] = useState('');
  const [items, setItems] = useState<ExerciseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ------------------- LOAD -------------------
  useEffect(() => {
    if (!routineId) return;

    setLoading(true);
    getRoutineWithExerciseAndRest(routineId)
      .then((data) => {
        if (!data) return;
        setRoutine(data);
        setName(data.name);

        const loaded: ExerciseItem[] = [];

        // Your transform already interleaves rests + exercises by position
        // and puts EVERYTHING into data.exercises[]
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

        // Final sort by position (just in case)
        loaded.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

        setItems(loaded);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [routineId]);

  // ------------------- SAVE -------------------
  const handleSubmit = useCallback(async () => {
    if (!routine || saving) return;

    setSaving(true);
    try {
      if (name.trim() !== routine.name) {
        await updateRoutineName(routineId, name.trim());
      }

      await saveRoutineExercisesAndRest(routineId, items);

      // TODO: send message of success alert
    } catch (err: any) {
      console.error('Save error:', err);
      // TODO: send error alert
    } finally {
      setSaving(false);
    }
  }, [routine, name, items, saving, routineId]);

  // ------------------- ADD REST -------------------
  const addRest = () => {
    const newRest: ExerciseItem = {
      key: `rest-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      isRest: true,
      restSeconds: 60,
      exerciseTypeId: 1,
      exercise: { id: 0, name: 'Rest 60s', description: '' },
      category: { id: 0, name: 'Rest', color: '#94a3b8' },
      amount: [{ quantity: 60, weight: 0 }],
    };
    setItems([...items, newRest]);
  };

  // ------------------- UI -------------------
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
            <Label>Routine Name:</Label>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Routine name"
              className="text-2xl font-bold"
            />
          </View>
          {items.length > 0 ? (
            <DraggableExerciseList data={items} onDataChange={setItems} />
          ) : (
            <Text className="text-center text-muted-foreground">No exercises yet</Text>
          )}

          <Button variant="outline" onPress={addRest} className="mt-2">
            <Icon as={Plus} className="mr-2" />
            <Text>Add Rest Block</Text>
          </Button>
        </CardContent>

        <CardFooter className="justify-center">
          {saving ? (
            <Button disabled>
              <Icon as={Loader2} className="mr-2 animate-spin" />
              <Text>Saving...</Text>
            </Button>
          ) : (
            <Button onPress={handleSubmit}>
              <Icon as={Save} className="text-primary-foreground" />
              <Text>Save</Text>
            </Button>
          )}
        </CardFooter>
      </Card>

      <FullScreenLoader visible={saving} message="Saving routine..." />
    </View>
  );
}
