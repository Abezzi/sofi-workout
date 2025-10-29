import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Label } from '@/components/ui/label';
import FastWorkouts from '@/components/routine/fast-workouts';
import RoutineList from '@/components/routine/routine-list';
import { useTranslation } from 'react-i18next';

export default function Screen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  function handleNewRoutine() {
    router.push({ pathname: '/routine/new-routine' });
  }

  function handleCopyRoutine() {
    router.push({ pathname: '/routine/copy-routine' });
  }

  return (
    <View className="flex-1" style={{ paddingBottom: insets.bottom }}>
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          {/*Buttons Top*/}
          <View className="flex-row items-center justify-center">
            <Button onPress={handleNewRoutine}>
              <Text>{t('home_screen.new_routine')}</Text>
            </Button>
            <Button
              variant="outline"
              className="shadow shadow-foreground/5"
              onPress={handleCopyRoutine}>
              <Text>{t('home_screen.copy_routine')}</Text>
            </Button>
          </View>
        </CardHeader>

        <CardContent>
          {/*Routine List*/}
          <Label htmlFor="routine">{t('home_screen.select_routine')}</Label>
          <RoutineList />
          {/*Tabs with the quick routines*/}
          <FastWorkouts />
        </CardContent>
      </Card>
    </View>
  );
}
