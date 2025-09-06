import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Category } from '@/db/schema';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import { EllipsisVertical } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { deleteCategoryById } from '@/db/queries/category.queries';
import { CategoryDeleteDialog } from './category-delete-dialog';
import { useRouter } from 'expo-router';

type CategoryListProps = {
  categories: Category[];
  onCategoryPress?: (category: Category) => void;
};

export function CategoryList({ categories, onCategoryPress }: CategoryListProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const { colorScheme } = useColorScheme();
  const router = useRouter();

  const handleEditPress = (categoryId: number) => {
    router.push(`/exercise/${categoryId}`);
    setDropdownVisible(null);
  };

  const handleDeletePress = (categoryId: number) => {
    setDropdownVisible(null);
    setDeleteDialogOpen(true);
    setCategoryToDelete(categoryId);
  };

  const handleDeleteConfirm = async () => {
    if (categoryToDelete) await deleteCategoryById(categoryToDelete);
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  const renderItem = ({ item }: { item: Category }) => {
    const isSelected = item.id === selectedId;
    const isDropdownVisible = item.id === dropdownVisible;

    function handleOptionsPress() {
      setDropdownVisible(isDropdownVisible ? null : item.id);
    }

    return (
      <Pressable
        onPress={() => {
          setSelectedId(item.id);
          onCategoryPress?.(item);
        }}
        style={styles.itemContainer}>
        <View className="flex-row items-center justify-between">
          <Text>
            <Text
              className="text-2xl"
              style={{
                color: item.color,
              }}>
              ■
            </Text>
            <Text className="text-2xl font-bold">{item.name}</Text>
          </Text>
          <DropdownMenu
            onOpenChange={(open: boolean) => {
              setDropdownVisible(open ? item.id : null);
            }}>
            <DropdownMenuTrigger asChild>
              <Pressable className="p-2" onPress={handleOptionsPress}>
                <EllipsisVertical color={colorScheme === 'dark' ? '#fff' : '#000'} size={24} />
              </Pressable>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              style={styles.dropdownMenu}
              side="bottom"
              align="end"
              sideOffset={8}>
              <DropdownMenuItem onPress={() => handleEditPress(item.id)}>
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
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
      <CategoryDeleteDialog
        open={deleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  listContainer: {
    padding: 16,
  },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
