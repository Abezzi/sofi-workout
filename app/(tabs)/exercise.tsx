import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { router } from 'expo-router';
import { CategoryList } from '@/components/category/category-list';
import { useEffect, useState } from 'react';
import { Category } from '@/db/schema';
import { getAllCategories } from '@/db/queries/category.queries';
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '@/db/schema';

export default function Screen() {
  let categories: Category[];
  const [data, setData] = useState<Category[]>([]);

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const handleGoToCategory = () => {
    router.navigate('/exercise/category');
  };

  const handleCategoryPress = (category: { id: number; name: string; color: string }) => {
    router.push(`/exercise/${category.id}/exercises/list`);
  };

  function handleCreateNewExercise() {
    router.push(`/exercise/new-exercise`);
  }

  useEffect(() => {
    const load = async () => {
      categories = await getAllCategories();
      setData(categories);
    };
    load();
  }, []);

  return (
    <View>
      <Button onPress={handleGoToCategory}>
        <Text>go to category</Text>
      </Button>
      <Button
        variant="outline"
        className="shadow shadow-foreground/5"
        onPress={handleCreateNewExercise}>
        <Text>New Exercise</Text>
      </Button>
      <Text>click on a category to see the exercises</Text>
      <CategoryList categories={data} onCategoryPress={handleCategoryPress} />
    </View>
  );
}
