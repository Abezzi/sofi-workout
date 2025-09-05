import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Category } from '@/db/schema';
import { Separator } from '../ui/separator';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CategoryListProps = {
  categories: Category[];
  onCategoryPress?: (category: Category) => void;
};

export function CategoryList({ categories, onCategoryPress }: CategoryListProps) {
  // const insets = useSafeAreaInsets();

  const renderItem = ({ item }: { item: Category }) => (
    <Pressable onPress={() => onCategoryPress?.(item)} style={styles.itemContainer}>
      <View style={styles.textContainer}>
        <Text>
          <Text
            style={{
              color: item.color,
              fontSize: 24,
              fontWeight: '500',
            }}>
            ■
          </Text>
          <Text
            style={{
              fontSize: 36,
              fontWeight: '500',
            }}>
            {item.name}
          </Text>
        </Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={Separator}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    padding: 16,
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
});
