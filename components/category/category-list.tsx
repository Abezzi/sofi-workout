import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Category } from '@/db/schema';

type CategoryListProps = {
  categories: Category[];
  onCategoryPress?: (category: Category) => void;
};

export function CategoryList({ categories, onCategoryPress }: CategoryListProps) {
  const renderItem = ({ item }: { item: Category }) => (
    <Pressable onPress={() => onCategoryPress?.(item)}>
      <Text>
        <Text
          style={{
            color: item.color,
            fontSize: 48,
            fontWeight: '500',
          }}>
          ■
        </Text>
        <Text
          style={{
            fontSize: 48,
            fontWeight: '500',
          }}>
          {item.name}
        </Text>
      </Text>
    </Pressable>
  );

  return (
    <FlatList
      data={categories}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
});
