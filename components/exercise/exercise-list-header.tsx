import { Category } from '@/db/schema';
import { Text } from '../ui/text';

export function ExerciseListHeader(category: Category) {
  return (
    <>
      <Text className="text-lg" style={{ backgroundColor: category.color }}>
        {category.name}
      </Text>
    </>
  );
}
