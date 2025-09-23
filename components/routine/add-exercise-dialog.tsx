import { ListPlus } from 'lucide-react-native';
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
import { Platform, View } from 'react-native';
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
  onConfirm: () => void;
  onCancel: () => void;
};

type Entry = {
  exerciseId: number;
  set: number;
  quantity: number;
  volume: number;
};

export function AddExerciseDialog({ open, onConfirm, onCancel }: AddExerciseDialogProps) {
  const [exerciseData, setExerciseData] = useState<Exercise[]>([]);
  const [entry, setEntry] = useState<Entry>({
    exerciseId: 0,
    set: 0,
    quantity: 0,
    volume: 0,
  });
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
            <Select id="exercise">
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

            <View className="flex flex-row items-center">
              <View className="flex w-1/2 flex-row items-center">
                <View className="mb-2 flex flex-row items-center">
                  <Label nativeID="quantity" className="w-2/3">
                    Quantity
                  </Label>
                  <Input
                    placeholder="0"
                    aria-labelledby="quantity"
                    keyboardType="numeric"
                    aria-errormessage="inputError"
                    value={entry.quantity.toString()}
                    className="w-1/3"
                  />
                </View>
                <View className="mb-2 flex flex-row items-center">
                  <Label nativeID="volume" className="w-2/3">
                    Volume
                  </Label>
                  <Input
                    placeholder="0"
                    aria-labelledby="volume"
                    keyboardType="numeric"
                    aria-errormessage="inputError"
                    value={entry.volume.toString()}
                    className="w-1/3"
                  />
                </View>
              </View>
            </View>

            <Button onPress={onConfirm}>
              <Icon as={ListPlus} className="text-primary-foreground" />
              <Text>Add Set</Text>
            </Button>
          </View>
        </View>
        <DialogFooter>
          <DialogClose asChild>
            <Button onPress={onCancel} variant="outline">
              <Text>Cancel</Text>
            </Button>
          </DialogClose>
          <Button onPress={onConfirm} variant="outline">
            <Text>Accept</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
