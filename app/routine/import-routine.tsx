import FullScreenLoader from '@/components/base/full-screen-loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { router, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ToastAndroid, View } from 'react-native';

export default function ImportRoutineScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [importString, setImportString] = useState<string | undefined>(undefined);

  const sendToast = (message: string) => {
    ToastAndroid.showWithGravity(message, ToastAndroid.SHORT, ToastAndroid.CENTER);
  };

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(requestAnimationFrame);
    try {
      if (!importString) {
        sendToast('No string provided');
        return;
      }
      // 1. check that string is valid

      // 2. push routine to db

      // 3. send toast
      sendToast('No string provided');

      // 4. send user to home screen
      router.push({ pathname: '/(tabs)/home' });
    } catch (error) {
      console.error('error importing routine, ', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    navigation.setOptions({ title: t('home_screen.import_routine') });
  }, []);

  return (
    <View className="flex-1">
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardContent>
          <Label>import routines</Label>
          <Textarea
            placeholder="!SW!:ROUTINE"
            value={importString}
            onChangeText={setImportString}
          />
        </CardContent>
        <CardFooter>
          <View className="flex-1 items-center justify-center">
            <Button onPress={handleSubmit}>
              <Text>Save</Text>
            </Button>
          </View>
        </CardFooter>
      </Card>
      <FullScreenLoader visible={loading} message="Importing Routing..." />
    </View>
  );
}
