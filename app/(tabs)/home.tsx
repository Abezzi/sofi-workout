import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function Screen() {
  const insets = useSafeAreaInsets();

  function handleNewRoutine() {
    router.push({ pathname: '/routine/new-routine' });
  }

  function handleCopyRoutine() {
    router.push({ pathname: '/routine/copy-routine' });
  }

  useEffect(() => { }, []);

  return (
    <SafeAreaView className="flex-1" style={{ paddingBottom: insets.bottom }}>
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <View className="flex-row items-center justify-center">
            <Button onPress={handleNewRoutine}>
              <Text>New Routine</Text>
            </Button>
            <Button
              variant="outline"
              className="shadow shadow-foreground/5"
              onPress={handleCopyRoutine}>
              <Text>Copy Routine</Text>
            </Button>
          </View>
        </CardHeader>
      </Card>
    </SafeAreaView>
  );
}
