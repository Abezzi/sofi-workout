import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Category, Exercise } from '@/db/schema';
import { Separator } from '../ui/separator';
import { ExerciseListHeader } from './exercise-list-header';
import { EllipsisVertical } from 'lucide-react-native';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import { useColorScheme } from 'nativewind';
import { Text } from '../ui/text';
import { ExerciseDeleteDialog } from './exercise-delete-dialog';
import { deleteExerciseById } from '@/db/queries/exercise.queries';
import { useRouter } from 'expo-router';

type ExerciseListProps = {
  exercises: Exercise[];
  onExercisePress?: (exercise: Exercise) => void;
  category: Category;
  onExerciseChange: () => void;
};

export function ExerciseList({
  exercises,
  onExercisePress,
  category,
  onExerciseChange,
}: ExerciseListProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState<number | null>(null);
  const { colorScheme } = useColorScheme();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<number | null>(null);
  const router = useRouter();

  const handleDeletePress = (exerciseId: number) => {
    setDropdownVisible(null);
    setDeleteDialogOpen(true);
    setExerciseToDelete(exerciseId);
  };

  const handleDeleteConfirm = async () => {
    if (exerciseToDelete) {
      await deleteExerciseById(exerciseToDelete);
      onExerciseChange();
    }
    setDeleteDialogOpen(false);
    setExerciseToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setExerciseToDelete(null);
  };

  const handleEditPress = (exercise: Exercise) => {
    console.log('Edit exercise: ', exercise.name);
    router.push({
      pathname: '/exercise/[categoryId]/exercises/[exerciseId]/edit' as const,
      params: { categoryId: category.id, exerciseId: exercise.id, name: exercise.name },
    });
    setDropdownVisible(null);
    onExerciseChange();
  };

  const renderItem = ({ item }: { item: Exercise }) => {
    const isSelected = item.id === selectedId;
    const isDropdownVisible = item.id === dropdownVisible;

    function handleOptionsPress() {
      setDropdownVisible(isDropdownVisible ? null : item.id);
    }

    return (
      <Pressable
        onPress={() => {
          setSelectedId(item.id);
          onExercisePress?.(item);
        }}
        style={styles.itemContainer}>
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold">{item.name}</Text>
          <DropdownMenu
            onOpenChange={(open: boolean) => {
              setDropdownVisible(open ? item.id : null);
            }}>
            <DropdownMenuTrigger asChild>
              <Pressable style={styles.iconPressable} onPress={handleOptionsPress}>
                <EllipsisVertical color={colorScheme === 'dark' ? '#fff' : '#000'} size={24} />
              </Pressable>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              style={styles.dropdownMenu}
              side="bottom"
              align="end"
              sideOffset={8}>
              <DropdownMenuItem onPress={() => handleEditPress(item)}>
                <Text>Edit</Text>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onPress={() => handleDeletePress(item.id)}>
                <Text>Delete</Text>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </View>
      </Pressable>
    );
  };

  return (
    <>
      <FlatList
        data={exercises}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={ExerciseListHeader(category)}
        ListHeaderComponentStyle={styles.listHeader}
      />
      <ExerciseDeleteDialog
        open={deleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  itemContainer: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  listHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  dropdownMenu: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    minWidth: 120,
    zIndex: 1000, // ensure dropdown appears above other elements
  },
  iconPressable: {
    padding: 8, // larger touch area for the icon
  },
});
