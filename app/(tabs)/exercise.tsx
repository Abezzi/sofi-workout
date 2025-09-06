import { View, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { router } from 'expo-router';
import { CategoryList } from '@/components/category/category-list';
import { useEffect, useState } from 'react';
import { Category } from '@/db/schema';
import { getAllCategories } from '@/db/queries/category.queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Screen() {
  let categories: Category[];
  const [data, setData] = useState<Category[]>([]);
  const insets = useSafeAreaInsets();

  const handleGoToCategory = () => {
    router.navigate('/exercise/category');
  };

  const handleCategoryPress = (category: { id: number; name: string; color: string }) => {
    router.push(`/exercise/${category.id}/exercises/exercise`);
  };

  function handleCreateNewExercise() {
    router.push(`/exercise/new-exercise`);
  }

  function handleCreateNewCategory() {
    router.push(`/exercise/new-category`);
  }

  useEffect(() => {
    const load = async () => {
      categories = await getAllCategories();
      setData(categories);
    };
    load();
  }, []);

  return (
    <SafeAreaView className="flex-1" style={{ paddingBottom: insets.bottom }}>
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <View className="flex-row items-center justify-center">
            <Button onPress={handleCreateNewCategory}>
              <Text>New Category</Text>
            </Button>
            <Button
              variant="outline"
              className="shadow shadow-foreground/5"
              onPress={handleCreateNewExercise}>
              <Text>New Exercise</Text>
            </Button>
          </View>
        </CardHeader>
        <CardContent className="gap-6">
          <CategoryList categories={data} onCategoryPress={handleCategoryPress} />
        </CardContent>
      </Card>
    </SafeAreaView>
  );
}
