import { Input } from '@/components/ui/input';
import { useRouter } from 'expo-router';
import { AlertCircleIcon, Loader2, Save } from 'lucide-react-native';
import { Label } from '@/components/ui/label';
import React, { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Text } from '@/components/ui/text';
import { getAllCategories } from '@/db/queries/category.queries';
import { Button } from '../ui/button';
import { Icon } from '../ui/icon';
import { Exercise, ExerciseType } from '@/db/schema/';
import { Category } from '@/db/schema/';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAllExerciseType } from '@/db/queries/exercise_type.queries';
import { postExercise } from '@/db/queries/exercise.queries';

export function ExerciseForm() {
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({
      ios: insets.bottom,
      android: insets.bottom + 24,
    }),
  };
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exercise, setExercise] = useState<Exercise>({
    id: 0,
    name: '',
    description: '',
    categoryId: 0,
    exerciseTypeId: 0,
  });

  const [categoriesData, setCategoriesData] = useState<Category[]>([]);
  const [exerciseTypesData, setExerciseTypesData] = useState<ExerciseType[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      let categories: Category[] = await getAllCategories();
      setCategoriesData(categories);
    };
    const loadTypes = async () => {
      let exerciseTypes: ExerciseType[] = await getAllExerciseType();
      setExerciseTypesData(exerciseTypes);
    };
    loadCategories();
    loadTypes();
  }, []);

  const handleInputChange = (field: keyof Exercise, value: string | number) => {
    setExercise((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    if (!exercise.name || !exercise.categoryId || !exercise.exerciseTypeId) {
      setShowAlert(true);
      setLoading(false);
      return;
    }

    const postSuccess = await postExercise(exercise);
    if (postSuccess) {
      setShowAlert(false);
      setLoading(false);
      const router = useRouter();
      router.navigate('/exercise');
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
          <CardTitle className="pb-2 text-center">New Exercise</CardTitle>
          <View className="flex-row">
            <CardDescription className="text-base font-semibold">
              here you can create a new exercise
            </CardDescription>
          </View>
        </CardHeader>
        <CardContent className="text-base font-semibold">
          {/*name*/}
          <Label nativeID="exerciseName">Name</Label>
          <Input
            placeholder="Name..."
            aria-labelledby="exerciseName"
            aria-errormessage="inputError"
            value={exercise.name}
            onChangeText={(exerciseName) => handleInputChange('name', exerciseName)}
          />

          {/*description*/}
          <Label className="pt-2" nativeID="exerciseDescription">
            Description
          </Label>
          <Input
            placeholder="Description..."
            aria-labelledby="exerciseDescription"
            aria-errormessage="inputError"
            value={exercise.description || undefined}
            onChangeText={(exerciseDescription) =>
              handleInputChange('description', exerciseDescription)
            }
          />

          {/*categoryId*/}
          <Label className="pt-2" nativeID="exerciseCategoryId">
            Category
          </Label>
          <Select
            value={{
              label:
                categoriesData.find((cat) => cat.id === exercise.categoryId)?.name ||
                'Select a category...',
              value: exercise.categoryId.toString(),
            }}
            onValueChange={(option) => {
              if (option) {
                handleInputChange('categoryId', parseInt(option.value, 10));
              } else {
                handleInputChange('categoryId', 0);
              }
            }}>
            <SelectTrigger className="h-12">
              <SelectValue
                placeholder="Select a Category"
                className={`text-lg ${exercise.categoryId === 0 ? 'text-muted-foreground' : ''}`}
              />
            </SelectTrigger>
            <SelectContent insets={contentInsets} className="">
              <SelectGroup>
                <SelectLabel className="text-lg">Categories</SelectLabel>
                {categoriesData.map((category) => (
                  <SelectItem
                    key={category.id}
                    label={category.name}
                    value={category.id.toString()}
                    className="text-lg">
                    {category.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/*exerciseTypeId*/}
          <Label className="pt-2" nativeID="exerciseTypeId">
            Type
          </Label>
          <Select
            value={{
              label:
                exerciseTypesData.find((et) => et.id === exercise.exerciseTypeId)?.name ||
                'Select an exercise type...',
              value: exercise.exerciseTypeId.toString(),
            }}
            onValueChange={(option) => {
              if (option) {
                handleInputChange('exerciseTypeId', parseInt(option.value, 10));
              } else {
                handleInputChange('exerciseTypeId', 0);
              }
            }}>
            <SelectTrigger className="h-12">
              <SelectValue
                placeholder="Select a Type"
                className={`text-lg ${exercise.exerciseTypeId === 0 ? 'text-muted-foreground' : ''}`}
              />
            </SelectTrigger>
            <SelectContent insets={contentInsets} className="">
              <SelectGroup>
                <SelectLabel>Types</SelectLabel>
                {exerciseTypesData.map((exerciseType) => (
                  <SelectItem
                    key={exerciseType.id}
                    label={exerciseType.name}
                    value={exerciseType.id.toString()}>
                    {exerciseType.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardContent>
        <CardFooter className="flex-col gap-3 pb-0">
          <Button onPress={handleSubmit} disabled={loading} className={loading ? 'opacity-75' : ''}>
            {loading ? (
              <>
                <View className="pointer-events-none animate-spin">
                  <Icon as={Loader2} />
                </View>
                <Text className="text-primary-foreground">Please wait</Text>
              </>
            ) : (
              <>
                <Icon as={Save} className="text-primary-foreground" />
                <Text className="text-primary-foreground">Create</Text>
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      {showAlert && (
        <View className="w-full max-w-xl gap-4">
          <Alert variant="destructive" icon={AlertCircleIcon}>
            <AlertTitle>Unable to create exercise.</AlertTitle>
            <AlertDescription>Please verify the fields and try again.</AlertDescription>
            <View role="list" className="ml-0.5 pb-2 pl-6">
              <Text role="listitem" className="text-sm text-red-500">
                <Text className="web:pr-2">•</Text> Check name
              </Text>
              <Text role="listitem" className="text-sm text-red-500">
                <Text className="web:pr-2">•</Text> Check description
              </Text>
              <Text role="listitem" className="text-sm text-red-500">
                <Text className="web:pr-2">•</Text> Check category
              </Text>
              <Text role="listitem" className="text-sm text-red-500">
                <Text className="web:pr-2">•</Text> Check type
              </Text>
            </View>
          </Alert>
        </View>
      )}
    </View>
  );
}
