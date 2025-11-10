import { Text } from '@/components/ui/text';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect } from 'react';

export default function ExerciseDetailScreen() {
  const navigation = useNavigation();
  const { name } = useLocalSearchParams();

  function changeNavigationTitle() {
    navigation.setOptions({ title: name || `Exercises` });
  }

  useEffect(() => {
    changeNavigationTitle();
  }, [navigation]);

  return (
    <>
      <Text>exercise detail</Text>
    </>
  );
}
