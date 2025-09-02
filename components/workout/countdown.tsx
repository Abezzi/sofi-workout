import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Animated, { LayoutAnimationConfig } from 'react-native-reanimated';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { useEffect, useState } from 'react';
import { Progress } from '../ui/progress';
import { useAudioPlayer } from 'expo-audio';

type CountdownPropsType = {
  time: number;
  title: string;
  next: string;
};

const Countdown = ({ time, title, next }: CountdownPropsType) => {
  const [timeLeft, setTimeLeft] = useState(time);
  const [progress, setProgress] = useState(100);

  let player = useAudioPlayer(require('../../assets/audio/alert.mp3'));
  let player5 = useAudioPlayer(require('../../assets/audio/countdown/esMX/male/5.mp3'));
  let player4 = useAudioPlayer(require('../../assets/audio/countdown/esMX/male/4.mp3'));
  let player3 = useAudioPlayer(require('../../assets/audio/countdown/esMX/male/3.mp3'));
  let player2 = useAudioPlayer(require('../../assets/audio/countdown/esMX/male/2.mp3'));
  let player1 = useAudioPlayer(require('../../assets/audio/countdown/esMX/male/1.mp3'));
  let infoSound = useAudioPlayer(require('../../assets/audio/info.mp3'));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(interval); // Stop the interval when time reaches 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000); // Update every second (1000ms)

    return () => clearInterval(interval);
  }, [time]);

  useEffect(() => {
    let percentOfTimeRemaining = (timeLeft / time) * 100;
    setProgress(percentOfTimeRemaining);

    // play sound when time remaining is 60, 5, 4, 3, 2, 1 and 0 secs
    if (timeLeft == 30) {
      player.seekTo(0);
      player.play();
    } else if (timeLeft == 5) {
      player5.seekTo(0);
      player5.play();
    } else if (timeLeft == 4) {
      player4.seekTo(0);
      player4.play();
    } else if (timeLeft == 3) {
      player3.seekTo(0);
      player3.play();
    } else if (timeLeft == 2) {
      player2.seekTo(0);
      player2.play();
    } else if (timeLeft == 1) {
      player1.seekTo(0);
      player1.play();
    } else if (timeLeft == 0) {
      infoSound.seekTo(0);
      infoSound.play();
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (seconds > 60) return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    return seconds;
  };

  return (
    <View className="items-center justify-center">
      <Card className="rounder-2xl w-full max-w-sm p-6">
        <CardHeader>
          <CardTitle className="pb-2 text-center uppercase">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <LayoutAnimationConfig skipEntering>
            <Animated.View key={timeLeft} className="items-center">
              <Text className="text-9xl">{formatTime(timeLeft)}</Text>
            </Animated.View>
          </LayoutAnimationConfig>
          <Progress
            value={progress}
            indicatorClassName={
              timeLeft < 10 ? 'bg-red-500' : timeLeft < 60 ? 'bg-yellow-500' : 'bg-green-500'
            }
          />
        </CardContent>
        <CardFooter className="flex-col gap-3 pb-0">
          <View className="flex-row items-center overflow-hidden">
            <Text className="text-muted-foreground">NEXT: {next}</Text>
          </View>
        </CardFooter>
      </Card>
    </View>
  );
};

export default Countdown;
