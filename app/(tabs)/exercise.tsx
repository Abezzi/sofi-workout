import { ActivityIndicator, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { router } from 'expo-router';
import { CategoryList } from '@/components/category/category-list';
import { useEffect, useState } from 'react';
import { Category } from '@/db/schema';
import { getAllCategories } from '@/db/queries/category.queries';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';

export default function Screen() {
  let categories: Category[];
  const [data, setData] = useState<Category[]>([]);
  const insets = useSafeAreaInsets();
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);
  const { colorScheme } = useColorScheme();

  const refreshCategories = async () => {
    setLoadingCategories(true);
    categories = await getAllCategories();
    setData(categories);
    setLoadingCategories(false);
  };

  const handleCategoryPress = (category: { id: number; name: string; color: string }) => {
    router.push({
      pathname: '/exercise/[categoryId]/exercises/exercise',
      params: { categoryId: category.id },
    });
  };

  function handleCreateNewExercise() {
    router.push(`/exercise/new-exercise`);
  }

  function handleCreateNewCategory() {
    router.push(`/exercise/new-category`);
  }

  useEffect(() => {
    refreshCategories();
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
          {loadingCategories ? (
            <View className="items-center justify-center">
              <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#FFF' : '#000'} />
              <Text>Loading Categories...</Text>
            </View>
          ) : (
            <CategoryList
              categories={data}
              onCategoryPress={handleCategoryPress}
              onCategoryChange={refreshCategories}
            />
          )}
        </CardContent>
      </Card>
    </SafeAreaView>
  );
}
