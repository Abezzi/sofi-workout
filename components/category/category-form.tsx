import { Input } from '@/components/ui/input';
import { useRouter } from 'expo-router';
import { AlertCircleIcon, Loader2, Save } from 'lucide-react-native';
import { Label } from '@/components/ui/label';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { postCategory } from '@/db/queries/category.queries';
import { Button } from '../ui/button';
import { Icon } from '../ui/icon';
import ColorPickerCustom from '../base/color-picker-custom';
import FullScreenLoader from '../base/full-screen-loader';

type Category = {
  id: number;
  name: string;
  color: string;
};

export function CategoryForm() {
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<Category>({
    id: 0,
    name: '',
    color: '',
  });

  const handleInputChange = (field: keyof Category, value: string) => {
    setCategory((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(requestAnimationFrame);

    if (!category.name || !category.color) {
      setShowAlert(true);
      setLoading(false);
      return;
    }

    // POST category into db
    const postSuccess = await postCategory(category);
    if (postSuccess) {
      setShowAlert(false);
      setLoading(false);
      const router = useRouter();
      router.navigate('/(tabs)/exercise');
      return;
    } else {
      // console.log("something happened");
    }

    setShowAlert(true);
    setLoading(false);
    return;
  };

  return (
    <View className="flex-1 items-center gap-5 bg-secondary/30 p-6">
      <Card className="w-full max-w-sm rounded-2xl p-6">
        <CardHeader className="items-center">
          <CardTitle className="pb-2 text-center">New Category</CardTitle>
          <View className="flex-row">
            <CardDescription className="text-base font-semibold">
              here you can create a new category
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
            <Button onPress={handleSubmit}>
              <Icon as={Save} className="text-primary-foreground" />
              <Text className="text-primary-foreground">Create</Text>
            </Button>
          )}
        </CardFooter>
      </Card>
      {showAlert && (
        <View className="w-full max-w-xl gap-4">
          <Alert variant="destructive" icon={AlertCircleIcon}>
            <AlertTitle>Unable to create your category.</AlertTitle>
            <AlertDescription>Please verify the fields and try again.</AlertDescription>
            <View role="list" className="ml-0.5 pb-2 pl-6">
              <Text role="listitem" className="text-sm text-red-500">
                <Text className="web:pr-2">•</Text> Check name
              </Text>
              <Text role="listitem" className="text-sm text-red-500">
                <Text className="web:pr-2">•</Text> Ensure color field is not empty
              </Text>
            </View>
          </Alert>
        </View>
      )}
      <FullScreenLoader visible={loading} />
    </View>
  );
}
