import { View } from 'react-native';
import { Button } from '../ui/button';
import { FastForward, Pause, Play, Rewind, Square } from 'lucide-react-native';
import { Icon } from '../ui/icon';

export const handleStartPause = () => { };
export const handleRewind = () => { };
export const handleStop = () => { };
export const handleFastForward = () => { };

export default function MediaControl() {
  return (
    <View className="flex flex-row items-center justify-center gap-1">
      <Button onPress={handleRewind}>
        <Icon as={Rewind} className="text-primary-foreground" />
      </Button>
      <Button onPress={handleStartPause}>
        <Icon as={Play} className="text-primary-foreground" />
      </Button>
      <Button onPress={handleStop}>
        <Icon as={Square} className="text-primary-foreground" />
      </Button>
      <Button onPress={handleFastForward}>
        <Icon as={FastForward} className="text-primary-foreground" />
      </Button>
    </View>
  );
}
