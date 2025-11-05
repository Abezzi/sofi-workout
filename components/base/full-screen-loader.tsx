import { ActivityIndicator, Modal, View } from 'react-native';
import { Text } from '@/components/ui/text';

export default function FullScreenLoader({ visible }: { visible: boolean }) {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="rounded-2xl bg-white p-8 shadow-lg">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-4 text-lg font-semibold text-gray-700">Saving...</Text>
        </View>
      </View>
    </Modal>
  );
}
