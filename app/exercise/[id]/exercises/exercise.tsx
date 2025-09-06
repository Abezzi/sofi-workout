import { ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ExerciseList } from '@/components/exercise/exercise-list';
import { Text } from '@/components/ui/text';
import { getCategoryById } from '@/db/queries/category.queries';
import { getAllExercisesByCategoryId } from '@/db/queries/exercise.queries';
import { Category, Exercise } from '@/db/schema';
import { useColorScheme } from 'nativewind';

export default function Screen() {
  const { id } = useLocalSearchParams() as { id: string };
  const [exercisesByCategory, setExercisesByCategory] = useState<Exercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState<boolean>(false);
  const [category, setCategory] = useState<Category>({
    id: 0,
    name: '',
    color: '',
  });
  const { colorScheme } = useColorScheme();
  const navigation = useNavigation();
  const router = useRouter();
  let exercisesData: Exercise[];
  let categoryData: Category;

  const loadExercisesByCategory = async () => {
    setLoadingExercises(true);
    const data = await getAllExercisesByCategoryId(parseInt(id));
    const dataCategory = await getCategoryById(parseInt(id));

    if (data !== undefined) {
      exercisesData = data;
    }

    if (dataCategory !== undefined) {
      categoryData = dataCategory;
    }

    setCategory(categoryData);
    setExercisesByCategory(exercisesData);
    setLoadingExercises(false);
  };

  function changeNavigationTitle() {
    navigation.setOptions({ title: `Exercises` });
  }

  useEffect(() => {
    loadExercisesByCategory();
    changeNavigationTitle();
  }, [navigation]);

  const handleExercisePress = (exercise: Exercise) => {
    console.log('pressed exercise list');
    router.push(`/exercise/${id}/exercises/${exercise.id}`);
  };

  return (
    <>
      {loadingExercises ? (
        <View className="items-center justify-center">
          <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#FFF' : '#000'} />
          <Text>Loading Exercises...</Text>
        </View>
      ) : (
        <ExerciseList
          exercises={exercisesByCategory}
          onExercisePress={handleExercisePress}
          category={category}
        />
      )}
    </>
  );
}
