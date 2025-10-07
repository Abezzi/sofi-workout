import { Tabs } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { BicepsFlexed, Dumbbell, LucideCalendar, LucideHome } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useColorScheme } from 'nativewind';
import { MoonStarIcon, SunIcon } from 'lucide-react-native';
import { UserMenu } from '@/components/user-menu';

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerRight: () => (
          <>
            <ThemeToggle />
            <UserMenu />
          </>
        ),
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.background, // Use theme color for tab bar
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary, // Use theme color for active tab
        tabBarInactiveTintColor: colors.text, // Use theme color for inactive tab
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerTitle: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <LucideHome size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="exercise"
        options={{
          title: 'Exercises',
          headerTitle: 'Exercises',
          tabBarLabel: 'Exercises',
          tabBarIcon: ({ color, size }) => <Dumbbell size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Workout',
          headerTitle: 'Workout',
          tabBarLabel: 'Workout',
          tabBarIcon: ({ color, size }) => <BicepsFlexed size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          headerTitle: 'Calendar',
          tabBarLabel: 'Calendar',
          tabBarIcon: ({ color, size }) => <LucideCalendar size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};

function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <Button onPress={toggleColorScheme} size="icon" variant="ghost" className="rounded-full">
      <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-6" />
    </Button>
  );
}
