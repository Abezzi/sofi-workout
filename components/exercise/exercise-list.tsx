import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Category, Exercise } from '@/db/schema';
import { Separator } from '../ui/separator';
import { ExercisListHeader } from './exercise-list-header';
import { EllipsisVertical } from 'lucide-react-native';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import { useColorScheme } from 'nativewind';

type ExerciseListProps = {
  exercises: Exercise[];
  onExercisePress?: (exercise: Exercise) => void;
  category: Category;
};

export function ExerciseList({ exercises, onExercisePress, category }: ExerciseListProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState<number | null>(null);
  const { colorScheme } = useColorScheme();

  const renderItem = ({ item }: { item: Exercise }) => {
    const isSelected = item.id === selectedId;
    const isDropdownVisible = item.id === dropdownVisible;

    function handleOptionsPress() {
      setDropdownVisible(isDropdownVisible ? null : item.id);
    }

    function handleEditPress() {
      console.log(`Edit exercise: ${item.name}`);
      setDropdownVisible(null);
      // logic here
    }

    function handleDeletePress() {
      console.log(`Delete exercise: ${item.name}`);
      setDropdownVisible(null);
      // logic here
    }

    return (
      <Pressable
        onPress={() => {
          setSelectedId(item.id);
          onExercisePress?.(item);
        }}
        style={styles.itemContainer}>
        <View style={styles.textContainer}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: isSelected ? 'bold' : 'normal', // Optional: bold text for selected
            }}>
            {item.name}
          </Text>
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
              <DropdownMenuItem onPress={handleEditPress}>
                <Text>Edit</Text>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onPress={handleDeletePress}>
                <Text>Delete</Text>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </View>
      </Pressable>
    );
  };

  return (
    <FlatList
      data={exercises}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
      ItemSeparatorComponent={Separator}
      ListHeaderComponent={ExercisListHeader(category)}
      ListHeaderComponentStyle={styles.listHeader}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  itemContainer: {
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  listHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    minWidth: 120,
    zIndex: 1000, // ensure dropdown appears above other elements
  },
  iconPressable: {
    padding: 8, // larger touch area for the icon
  },
});
