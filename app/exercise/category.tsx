import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { CategoryList } from '@/components/category/category-list';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '@/db/schema';
import { useEffect, useState } from 'react';
import { Category } from '@/db/schema';
import { getAllCategories } from '@/db/queries/category.queries';

export default function Screen() {
  const router = useRouter();
  const [data, setData] = useState<Category[]>([]);

  //TODO: SQL queries
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  let categories: Category[];

  const loadCategories = () => {
    const load = async () => {
      categories = await getAllCategories();
      setData(categories);
    };
    load();
  };

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCategoryPress = (category: { id: number; name: string; color: string }) => {
    router.push(`/exercise/${category.id}`);
  };

  function handleCreateNewCategory() {
    router.push(`/exercise/new-category`);
  }

  return (
    <View>
      <Button
        variant="outline"
        className="shadow shadow-foreground/5"
        onPress={handleCreateNewCategory}>
        <Text>New Category</Text>
      </Button>
      <CategoryList
        categories={data}
        onCategoryPress={handleCategoryPress}
        onCategoryChange={loadCategories}
      />
    </View>
  );
}
