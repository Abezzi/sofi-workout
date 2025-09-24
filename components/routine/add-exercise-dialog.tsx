import { ListPlus, X } from 'lucide-react-native';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Icon } from '../ui/icon';
import { Text } from '../ui/text';
import { Platform, Pressable, View } from 'react-native';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useEffect, useRef, useState } from 'react';
import { Exercise } from '@/db/schema';
import { getAllExercises } from '@/db/queries/exercise.queries';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PortalHost } from '@rn-primitives/portal';
import { TriggerRef } from '@rn-primitives/select';
import { Input } from '../ui/input';

type AddExerciseDialogProps = {
  open: boolean;
  onConfirm: (newExercise: ExerciseItem) => void;
  onCancel: () => void;
};

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

type Option = {
  value: string;
  label: string;
};

type SetEntry = {
  id: string;
  quantity: string;
  weight: string;
};

export function AddExerciseDialog({ open, onConfirm, onCancel }: AddExerciseDialogProps) {
  const [selectedExercise, setSelectedExercise] = useState<Option | undefined>(undefined);
  const [exerciseData, setExerciseData] = useState<Exercise[]>([]);
  const [sets, setSets] = useState<SetEntry[]>([
    { id: `${Date.now()}`, quantity: '0', weight: '0' },
  ]);
  const ref = useRef<TriggerRef>(null);
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({
      ios: insets.bottom,
      android: insets.bottom + 24,
    }),
  };

  const loadAllExercises = async () => {
    const data = await getAllExercises();
    if (data !== undefined) setExerciseData(data);
  };

  const handleAddSet = () => {
    setSets((prev) => [
      ...prev,
      { id: `${Date.now()}-${prev.length}`, quantity: '0', weight: '0' },
    ]);
  };

  const handleDeleteSet = (id: string) => {
    setSets((prev) => prev.filter((set) => set.id !== id));
  };

  const handleQuantityChange = (id: string, value: string) => {
    setSets((prev) => prev.map((set) => (set.id === id ? { ...set, quantity: value } : set)));
  };

  const handleWeightChange = (id: string, value: string) => {
    setSets((prev) => prev.map((set) => (set.id === id ? { ...set, weight: value } : set)));
  };

  const resetForm = () => {
    setSelectedExercise(undefined);
    setSets([{ id: `${Date.now()}`, quantity: '0', weight: '0' }]);
  };

  const handleConfirm = () => {
    if (selectedExercise) {
      const selectedExerciseData = exerciseData.find(
        (ex) => ex.id.toString() === selectedExercise.value
      );
      if (selectedExerciseData) {
        const newExercise: ExerciseItem = {
          key: '',
          exerciseName: selectedExerciseData.name,
          exerciseTypeId: selectedExerciseData.exerciseTypeId || 1,
          categoryId: selectedExerciseData.categoryId || 1,
          amount: sets.map((set) => ({
            quantity: parseInt(set.quantity) || 0,
            weight: parseInt(set.weight) || 0,
          })),
        };
        onConfirm(newExercise);
        resetForm();
      }
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  useEffect(() => {
    loadAllExercises();
  }, []);

  return (
    <Dialog open={open}>
      <DialogContent className="relative z-[1000]">
        <PortalHost name="dialog-overlay" />
        <DialogHeader>
          <DialogTitle>Add Exercise</DialogTitle>
          <DialogDescription>Here i should have the selection of exercises.</DialogDescription>
        </DialogHeader>
        <View className="grid gap-4">
          <View className="gap-3">
            <Label htmlFor="exercise">Exercise</Label>
            <Select
              id="exercise"
              value={selectedExercise}
              onValueChange={(option) => setSelectedExercise(option)}>
              <SelectTrigger className="h-12" ref={ref}>
                <SelectValue placeholder="Select an Exercise" className="text-lg" />
              </SelectTrigger>
              <SelectContent insets={contentInsets} className="max-h-96 w-auto rounded-md">
                <SelectGroup>
                  <SelectLabel className="text-lg">Exercises</SelectLabel>
                  {exerciseData.map((exercise) => (
                    <SelectItem
                      key={exercise.id}
                      label={exercise.name}
                      value={exercise.id.toString()}>
                      {exercise.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {sets.map((set, index) => (
              <View key={set.id} className="mb-2 flex flex-row items-center gap-2">
                <View className="flex-1">
                  <Label nativeID={`quantity-${set.id}`}>Quantity (Set {index + 1})</Label>
                  <Input
                    placeholder="0"
                    aria-labelledby={`quantity-${set.id}`}
                    keyboardType="numeric"
                    value={set.quantity}
                    onChangeText={(value) => handleQuantityChange(set.id, value)}
                    className="h-12"
                  />
                </View>
                <View className="flex-1">
                  <Label nativeID={`weight-${set.id}`}>Weight (Set {index + 1})</Label>
                  <Input
                    placeholder="0"
                    aria-labelledby={`weight-${set.id}`}
                    keyboardType="numeric"
                    value={set.weight}
                    onChangeText={(value) => handleWeightChange(set.id, value)}
                    className="h-12"
                  />
                </View>
                <Pressable
                  onPress={() => handleDeleteSet(set.id)}
                  disabled={sets.length === 1}
                  className={`p-2 ${sets.length === 1 ? 'opacity-50' : ''}`}>
                  <Icon as={X} className="size-6" />
                </Pressable>
              </View>
            ))}

            <Button onPress={handleAddSet}>
              <Icon as={ListPlus} className="text-primary-foreground" />
              <Text>Add Set</Text>
            </Button>
          </View>
        </View>
        <DialogFooter>
          <DialogClose asChild>
            <Button onPress={handleCancel} variant="outline">
              <Text>Cancel</Text>
            </Button>
          </DialogClose>
          <Button onPress={handleConfirm} variant="outline" disabled={!selectedExercise}>
            <Text>Accept</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
