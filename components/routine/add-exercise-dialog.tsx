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
  NativeSelectScrollView,
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

type AddExerciseDialogProps = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function AddExerciseDialog({ open, onConfirm, onCancel }: AddExerciseDialogProps) {
  const [exerciseData, setExerciseData] = useState<Exercise[]>([]);
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
          <View className="grid gap-3">
            <Label htmlFor="exercise">Exercise</Label>
            <Select id="exercise">
              <SelectTrigger className="h-12" ref={ref}>
                <SelectValue placeholder="Select an Exercise" className="text-lg" />
              </SelectTrigger>
              <SelectContent
                portalHost="dialog-overlay"
                insets={contentInsets}
                className="z-[4000] mt-1 max-h-96 rounded-md"
                style={{ zIndex: 3000 }}>
                <NativeSelectScrollView>
                  <SelectGroup>
                    <SelectLabel className="text-lg">Exercises</SelectLabel>
                    {exerciseData.map((exercise) => (
                      <SelectItem
                        key={exercise.id}
                        label={exercise.name}
                        value={exercise.id.toString()}
                        className="text-lg">
                        {exercise.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </NativeSelectScrollView>
              </SelectContent>
            </Select>
          </View>
        </View>
        <DialogFooter>
          <DialogClose>
            <Button onPress={onCancel} variant="outline">
              <Text>Cancel</Text>
            </Button>
          </DialogClose>
          <Button onPress={onConfirm}>
            <Icon as={ListPlus} className="text-primary-foreground" />
            <Text>Add</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
