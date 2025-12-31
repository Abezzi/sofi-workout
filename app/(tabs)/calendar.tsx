import { View } from 'react-native';
import { Card, CardContent } from '@/components/ui/card';
import FullScreenLoader from '@/components/base/full-screen-loader';
import { useCallback, useEffect, useState } from 'react';
import { Calendar } from 'react-native-calendars';
import { Text } from '@/components/ui/text';
import { getWorkoutHistory, WorkoutHistorySummary } from '@/db/queries/workout.queries';
import { format, startOfMonth, parseISO } from 'date-fns';

export default function CalendarScreen() {
  // const { userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState('');
  const [monthHistory, setMonthHistory] = useState<WorkoutHistorySummary | null>(null);
  const [currentMonth, setCurrentMonth] = useState<string>(format(new Date(), 'yyyy-MM'));

  const loadMonthHistory = useCallback(async (monthStr: string) => {
    setLoading(true);
    try {
      // Parse the month string to a date (first day of month)
      const monthDate = parseISO(`${monthStr}-01`);

      const result = await getWorkoutHistory({
        // userId: 'temp-user-id',
        period: 'month',
        referenceDate: monthDate,
      });

      setMonthHistory(result);
    } catch (error) {
      console.error('Error loading workout history:', error);
      setMonthHistory(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // When user navigates to a different month in calendar
  const handleMonthChange = (month: { dateString: string }) => {
    const newMonth = month.dateString.slice(0, 7); // "yyyy-MM"
    if (newMonth !== currentMonth) {
      setCurrentMonth(newMonth);
      loadMonthHistory(newMonth);
    }
  };

  // Initial load (current month)
  useEffect(() => {
    loadMonthHistory(currentMonth);
  }, [loadMonthHistory, currentMonth]);

  const markedDates =
    monthHistory?.items.reduce(
      (acc, workout) => {
        const date = workout.completedAt.split('T')[0]; // YYYY-MM-DD
        acc[date] = {
          marked: true,
          dotColor: 'orange',
        };
        return acc;
      },
      {} as Record<string, any>
    ) ?? {};

  if (selected) {
    markedDates[selected] = {
      ...markedDates[selected],
      selected: true,
      disableTouchEvent: true,
      selectedColor: 'orange',
    };
  }

  return (
    <View className="flex-1">
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardContent>
          <Calendar
            onDayPress={(day) => setSelected(day.dateString)}
            onMonthChange={handleMonthChange}
            markedDates={markedDates}
            theme={{
              todayTextColor: '#f97316',
              selectedDayBackgroundColor: '#f97316',
              arrowColor: '#f97316',
            }}
          />

          {selected && (
            <Text className="mt-4 text-center text-muted-foreground">Selected: {selected}</Text>
          )}

          {monthHistory && (
            <View className="mt-6 space-y-2">
              <Text className="text-lg font-medium">
                {format(parseISO(`${currentMonth}-01`), 'MMMM yyyy')} Summary
              </Text>
              <Text className="text-muted-foreground">
                Workouts: <Text className="font-medium">{monthHistory.totalWorkouts}</Text>
              </Text>
              <Text className="text-muted-foreground">
                Total sets: <Text className="font-medium">{monthHistory.totalSets}</Text>
              </Text>
              {monthHistory.totalVolume && (
                <Text className="text-muted-foreground">
                  Total volume:{' '}
                  <Text className="font-medium">
                    {monthHistory.totalVolume.toLocaleString()} kg
                  </Text>
                </Text>
              )}
            </View>
          )}
        </CardContent>
      </Card>

      <FullScreenLoader
        visible={loading}
        message={`Loading ${format(parseISO(`${currentMonth}-01`), 'MMMM yyyy')}...`}
      />
    </View>
  );
}
