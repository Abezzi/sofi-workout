import { View } from 'react-native';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Text } from '../ui/text';
import { useState } from 'react';
import Hiit from './interval-training/hiit';
import Emom from './interval-training/emom';
import Tabata from './interval-training/tabata';

export default function FastWorkouts() {
  const [tabValue, setTabValue] = useState<string>('hiit');

  return (
    <View className="flex w-full max-w-sm flex-col gap-6 pt-4">
      <Tabs value={tabValue} onValueChange={setTabValue}>
        <TabsList>
          <TabsTrigger value="hiit">
            <Text>HIIT</Text>
          </TabsTrigger>
          <TabsTrigger value="emom">
            <Text>EMOM</Text>
          </TabsTrigger>
          <TabsTrigger value="tabata">
            <Text>Tabata</Text>
          </TabsTrigger>
          <TabsTrigger value="amrap">
            <Text>AMRAP</Text>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="hiit">
          <Hiit />
        </TabsContent>
        <TabsContent value="emom">
          <Emom />
        </TabsContent>
        <TabsContent value="tabata">
          <Tabata />
        </TabsContent>
      </Tabs>
    </View>
  );
}
