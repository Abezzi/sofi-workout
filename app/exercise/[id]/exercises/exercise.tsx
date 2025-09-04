import { useLocalSearchParams } from 'expo-router';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ExerciseList } from '@/components/exercise/exercise-list';
import { Text } from '@/components/ui/text';
import { getCategoryById } from '@/db/queries/category.queries';
import { getAllExercisesByCategoryId } from '@/db/queries/exercise.queries';
import { Category, Exercise } from '@/db/schema';

export default function Screen() {
  const { id } = useLocalSearchParams() as { id: string };
  const [exercisesByCategory, setExercisesByCategory] = useState<Exercise[]>([]);
  const [category, setCategory] = useState<Category>({
    id: 0,
    name: '',
    color: '',
  });
  let exercisesData: Exercise[];
  let categoryData: Category;
  const router = useRouter();

  useEffect(() => {
    const loadExercisesByCategory = async () => {
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
    };
    loadExercisesByCategory();
  }, []);

  const handleExercisePress = (exercise: Exercise) => {
    console.log('pressed exercise list');
    router.push(`/exercise/${id}/exercises/${exercise.id}`);
  };

  return (
    <>
      <Text>category idddddd: {id}</Text>
      <ExerciseList
        exercises={exercisesByCategory}
        onExercisePress={handleExercisePress}
        category={category}
      />
    </>
  );
}
