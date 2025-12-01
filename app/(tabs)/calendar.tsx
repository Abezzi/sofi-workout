import { View } from 'react-native';
import { Card, CardContent } from '@/components/ui/card';
import FullScreenLoader from '@/components/base/full-screen-loader';
import { useEffect, useState } from 'react';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Text } from '@/components/ui/text';

export default function CalendarScreen() {
  const [loading, setLoading] = useState<boolean>(false);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    // setLoading(true);
    const fetchData = async () => {
      // TODO: fetch historial
      await new Promise(requestAnimationFrame);
      try {
      } catch (error) {
        console.error('error loading history. ', error);
      } finally {
        setLoading(false);
      }
      fetchData();
    };
  });

  return (
    <View className="flex-1">
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardContent>
          <Calendar
            onDayPress={(day) => {
              day ? setSelected(day.dateString) : '';
            }}
            markedDates={{
              [selected]: {
                selected: true,
                disableTouchEvent: true,
                selectedColor: 'orange',
              },
            }}
          />
          <Text>mm{selected}</Text>
        </CardContent>
      </Card>
      <FullScreenLoader visible={loading} message="Loading Calendar..." />
    </View>
  );
}
