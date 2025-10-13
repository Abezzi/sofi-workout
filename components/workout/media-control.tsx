import { View } from 'react-native';
import { Button } from '../ui/button';
import { FastForward, Pause, Play, Rewind, Square } from 'lucide-react-native';
import { Icon } from '../ui/icon';

export const handleStartPause = () => {};
export const handleRewind = () => {};
export const handleStop = () => {};
export const handleFastForward = () => {};

interface MediaControlProps {
  onStartPause: () => void;
  onStop: () => void;
  onRewind: () => void;
  onFastForward: () => void;
  isPaused: boolean;
}

export default function MediaControl({
  onStartPause,
  onStop,
  onRewind,
  onFastForward,
  isPaused,
}: MediaControlProps) {
  return (
    <View className="m-2 flex flex-row items-center justify-center gap-1">
      <Button
        onPress={onRewind}
        variant="outline"
        size="lg"
        className="bg-background dark:bg-primary-foreground">
        <Icon as={Rewind} className="text-primary dark:text-white" />
      </Button>
      <Button
        onPress={onStartPause}
        variant="outline"
        size="lg"
        className="bg-background dark:bg-primary-foreground">
        <Icon as={isPaused ? Play : Pause} className="text-primary dark:text-white" />
      </Button>
      <Button
        onPress={onStop}
        variant="outline"
        size="lg"
        className="bg-background dark:bg-primary-foreground">
        <Icon as={Square} className="text-primary dark:text-white" />
      </Button>
      <Button
        onPress={onFastForward}
        variant="outline"
        size="lg"
        className="bg-background dark:bg-primary-foreground">
        <Icon as={FastForward} className="text-primary dark:text-white" />
      </Button>
    </View>
  );
}
