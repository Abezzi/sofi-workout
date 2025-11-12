import React, { useCallback, useEffect } from 'react';
import {
  Modal,
  View,
  Pressable,
  Dimensions,
  Platform,
  ToastAndroid,
  Alert,
  Linking,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { Text } from '@/components/ui/text';
import { Share2, Mail, MessageCircle, X, Facebook, Send, Instagram } from 'lucide-react-native';
import { encodeRoutine } from '@/utils/encode-routine';
import { getRoutineWithExerciseAndRest } from '@/db/queries/routine.queries';
import { shareViaFile } from '@/utils/share-routine';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ShareOption {
  id: string;
  label: string;
  Icon: React.ComponentType<any>;
  color: string;
  action: (url: string) => Promise<void>;
}

interface ShareBottomSheetProps {
  routineId: number;
  visible: boolean;
  onClose: () => void;
}

export default function ShareBottomSheet({ routineId, visible, onClose }: ShareBottomSheetProps) {
  // animation
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 250 });
      backdropOpacity.value = withTiming(0.4, { duration: 250 });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 200 });
      backdropOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const toast = useCallback((msg: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      Alert.alert('Success', msg);
    }
  }, []);

  const generateData = useCallback(async (): Promise<string> => {
    const routine = await getRoutineWithExerciseAndRest(routineId);
    if (!routine) throw new Error('Routine not found');
    return encodeRoutine(routine);
  }, [routineId]);

  const handleOption = useCallback(
    async (opt: ShareOption) => {
      try {
        const data = await generateData();
        const appUrl = `https://sofi-workout.com/routine?data=${encodeURIComponent(data)}`;
        await opt.action(appUrl);
        onClose();
      } catch (e) {
        console.error(e);
        toast('Failed to share');
      }
    },
    [generateData, onClose, toast]
  );

  const options: ShareOption[] = [
    {
      id: 'copy',
      label: 'Copy link',
      Icon: Share2,
      color: '#6B7280',
      action: async (url) => {
        await Clipboard.setStringAsync(url);
        toast('Link copied');
      },
    },
    {
      id: 'facebook',
      label: 'Facebook',
      Icon: Facebook,
      color: '#1877F2',
      action: async (url) => {
        const share = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        await Linking.openURL(share);
      },
    },
    {
      id: 'messenger',
      label: 'Messenger',
      Icon: MessageCircle,
      color: '#00B2FF',
      action: async (url) => {
        const scheme = `fb-messenger://share?link=${encodeURIComponent(url)}`;
        const can = await Linking.canOpenURL(scheme);
        if (can) {
          await Linking.openURL(scheme);
        } else {
          const fileUri = await shareViaFile(url);
          await Sharing.shareAsync(fileUri, { dialogTitle: 'Messenger' });
        }
      },
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      Icon: Send,
      color: '#25D366',
      action: async (url) => {
        const scheme = `whatsapp://send?text=${encodeURIComponent(url)}`;
        const can = await Linking.canOpenURL(scheme);
        const fileUri = await shareViaFile(url);
        if (can) await Linking.openURL(scheme);
        else await Sharing.shareAsync(fileUri, { dialogTitle: 'WhatsApp' });
      },
    },
    {
      id: 'email',
      label: 'Email',
      Icon: Mail,
      color: '#6B7280',
      action: async (url) => {
        const subject = encodeURIComponent('My workout routine');
        const body = encodeURIComponent(`${url}\n\nShared via Your App`);
        await Linking.openURL(`mailto:?subject=${subject}&body=${body}`);
      },
    },
    {
      id: 'threads',
      label: 'Threads',
      Icon: MessageCircle,
      color: '#000000',
      action: async (url) => {
        const share = `https://www.threads.net/compose?text=${encodeURIComponent(url)}`;
        await Linking.openURL(share);
      },
    },
    {
      id: 'x',
      label: 'X',
      Icon: X,
      color: '#000000',
      action: async (url) => {
        const share = `https://twitter.com/intent/tweet?text=${encodeURIComponent(url)}`;
        await Linking.openURL(share);
      },
    },
    {
      id: 'instagram',
      label: 'Instagram',
      Icon: Instagram,
      color: '#E4405F',
      action: async (url) => {
        // try instagram app
        const igScheme = `instagram://library?AssetPath=${encodeURIComponent(url)}`;
        const canOpen = await Linking.canOpenURL(igScheme);

        if (canOpen) {
          await Linking.openURL(igScheme);
          return;
        }

        // fallback, native share (user can pick Instagram)
        const fileUri = await shareViaFile(url);
        await Sharing.shareAsync(fileUri, {
          dialogTitle: 'Share to Instagram',
        });
      },
    },
  ];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent>
      {/* backdrop */}
      <Pressable className="flex-1" onPress={onClose} style={{ backgroundColor: 'transparent' }}>
        <Animated.View className="absolute inset-0 bg-black" style={backdropStyle} />
      </Pressable>

      {/* sheet */}
      <Animated.View
        className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white px-4 py-6 dark:bg-gray-900"
        style={[sheetStyle, { maxHeight: SCREEN_HEIGHT * 0.45 }]}>
        {/* drag handle, not working yet
        <View className="mb-4 h-1 w-10 self-center rounded-full bg-gray-300" />
        */}

        {/* grid */}
        <View className="flex-row flex-wrap justify-between gap-4">
          {options.map((opt) => {
            const LucideIcon = opt.Icon;
            return (
              <Pressable
                key={opt.id}
                onPress={() => handleOption(opt)}
                className="w-16 items-center">
                <View
                  className="mb-2 size-14 items-center justify-center rounded-full"
                  style={{ backgroundColor: opt.color + '20' }}>
                  <LucideIcon className="size-6" color={opt.color} />
                </View>
                <Text
                  className="line-clamp-1 text-center text-xs text-muted-foreground"
                  numberOfLines={1}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>
    </Modal>
  );
}
