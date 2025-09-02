import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  deleteCategoryById,
  getCategoryById,
  updateCategoryById,
} from '@/db/queries/category.queries';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icon } from '@/components/ui/icon';
import { useLocalSearchParams } from 'expo-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LucideTrash, Pencil, Loader2 } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import ColorPickerCustom from '@/components/base/color-picker-custom';

type Category = {
  id: number;
  name: string;
  color: string;
};

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams() as { id: string };
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<Category>({
    id: 0,
    name: '',
    color: '',
  });
  let categoryData: Category;
  const router = useRouter();

  useEffect(() => {
    // load the data
    const load = async () => {
      const data = await getCategoryById(parseInt(id));
      if (data !== undefined) {
        categoryData = data;
      }
      setCategory(categoryData);
    };
    load();
  }, []);

  const handleInputChange = (field: keyof Category, value: string) => {
    setCategory((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDelete = async () => {
    await deleteCategoryById(parseInt(id));
    router.navigate('/exercise/category');
    console.log('deleted: ', id);
  };

  const handleEdit = async () => {
    setLoading(true);

    if (!category.name || !category.color) {
      setShowAlert(true);
      setLoading(false);
      return;
    }

    // update category into db
    const updateSuccess = await updateCategoryById(parseInt(id), category);
    if (updateSuccess) {
      setShowAlert(false);
      setLoading(false);
      router.navigate('/exercise/category');
      return;
    } else {
      console.log('something happened');
    }

    setShowAlert(true);
    setLoading(false);
    return;
  };

  return (
    <View className="flex-1 items-center gap-5 bg-secondary/30 p-6">
      <Card className="w-full max-w-sm rounded-2xl p-6">
        <CardHeader className="items-center">
          <CardTitle className="pb-2 text-center">Category Details</CardTitle>
          <View className="flex-row">
            <CardDescription className="text-base font-semibold">
              here you can edit the category
            </CardDescription>
          </View>
        </CardHeader>
        <CardContent className="text-base font-semibold">
          <Label nativeID="categoryName">Category</Label>
          <Input
            placeholder="Category Name..."
            aria-labelledby="categoryName"
            aria-errormessage="inputError"
            value={category.name}
            onChangeText={(categoryName) => handleInputChange('name', categoryName)}
          />
          <Label nativeID="categoryColor" className="pt-2">
            Color
          </Label>
          <ColorPickerCustom
            onColorSelect={(color) => handleInputChange('color', color)}
            initialColor={category.color || '#FFFFFF'}
          />
        </CardContent>
        <CardFooter className="flex-col gap-3 pb-0">
          {loading ? (
            <Button disabled>
              <View className="pointer-events-none animate-spin">
                <Icon as={Loader2} className="text-primary-foreground" />
              </View>
              <Text>Please wait</Text>
            </Button>
          ) : (
            <Button onPress={handleEdit}>
              <Icon as={Pencil} className="text-primary-foreground" />
              <Text>Edit</Text>
            </Button>
          )}

          {loading ? (
            <Button disabled>
              <View className="pointer-events-none animate-spin">
                <Icon as={Loader2} className="text-primary-foreground" />
              </View>
              <Text>Please wait</Text>
            </Button>
          ) : (
            <Button onPress={handleDelete}>
              <Icon as={LucideTrash} className="text-red-500" />
              <Text>DELETE</Text>
            </Button>
          )}
        </CardFooter>
      </Card>
    </View>
  );
}
