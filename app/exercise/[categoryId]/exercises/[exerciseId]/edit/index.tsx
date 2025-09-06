import { Text } from '@/components/ui/text';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect } from 'react';

export default function EditExercise() {
  const navigation = useNavigation();
  const { name } = useLocalSearchParams();

  function changeNavigationTitle() {
    navigation.setOptions({ title: 'Editing: ' + name || 'Edit Exercise' });
  }

  useEffect(() => {
    changeNavigationTitle();
  }, [navigation]);

  return (
    <>
      <Text>huahuahu</Text>
    </>
  );
}
