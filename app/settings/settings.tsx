import { Text } from '@/components/ui/text';
import { router, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Language, setLanguage } from '@/src/store/slices/locale/localeSlice';
import {
  CountdownVoice,
  setCountdownVoice,
  setWeight,
  setHeight,
  setUnitSystem,
  UnitSystem,
} from '@/src/store/slices/settings/settingsSlice';
import { useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/src/store/storeSetup';
import { useDispatch } from 'react-redux';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { imperialToMetric, metricToImperial } from '@/utils/convert-unit-system';
import { Button } from '@/components/ui/button';
import FullScreenLoader from '@/components/base/full-screen-loader';

const languageOptions: { value: Language; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'ko', label: '한국어' },
];

const countdownVoiceOptions: { value: CountdownVoice; label: string }[] = [
  { value: 'enUS/male', label: 'Male English' },
  { value: 'enUS/female', label: 'Female English' },
  { value: 'esMX/male', label: 'Hombre Español' },
  { value: 'koKR/male', label: '한국 남자' },
  { value: 'koKR/female', label: '한국 여성' },
];

type ImperialUnit = {
  feet: number;
  inches: number;
};

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  // initial values
  const currentLanguage = useSelector((state: RootState) => state.locale.currentLanguage);
  const { currentWeight, currentHeight, currentUnitSystem, currentCountdownVoice } = useSelector(
    (state: RootState) => state.settings
  );
  const dispatch = useDispatch<AppDispatch>();

  const [localWeight, setLocalWeight] = useState<string>(currentWeight?.toString() ?? '');
  const [localHeight, setLocalHeight] = useState<string>(currentHeight?.toString() ?? '');
  const [localUnitSystem, setLocalUnitSystem] = useState<UnitSystem>(currentUnitSystem);
  const [localLanguage, setLocalLanguage] = useState<Language | null>(currentLanguage);
  const [localCountdownVoice, setLocalCountdownVoice] = useState<CountdownVoice | undefined>(
    currentCountdownVoice
  );
  const [imperialUnit, setImperialUnit] = useState<ImperialUnit>({ feet: 0, inches: 0 });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLocalWeight(currentWeight?.toString() ?? '');
    setLocalHeight(currentHeight?.toString() ?? '');
    setLocalUnitSystem(currentUnitSystem);
    setLocalLanguage(currentLanguage);
    setLocalCountdownVoice(currentCountdownVoice);

    // Convert metric height to imperial if needed
    if (currentUnitSystem === 'imperial' && currentHeight) {
      setImperialUnit(metricToImperial(currentHeight));
    }
  }, [currentWeight, currentHeight, currentUnitSystem, currentLanguage, currentCountdownVoice]);

  // handlers
  const handleCountdownVoiceChange = (option: { value: string; label: string } | undefined) => {
    if (option?.value) {
      setLocalCountdownVoice(option.value as CountdownVoice);
    }
  };
  const handleLanguageChange = (option: { value: string; label: string } | undefined) => {
    if (option?.value) {
      setLocalLanguage(option.value as Language);
    }
  };
  const handleWeightChange = (text: string) => setLocalWeight(text);
  const handleHeightChange = (text: string) => setLocalHeight(text);
  const handleInputChange = (field: keyof ImperialUnit, value: number) => {
    setImperialUnit((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleUnitSystemChange = (value: string | undefined) => {
    if (!value || value === localUnitSystem) return;
    setLocalUnitSystem(value as UnitSystem);

    // convert current height when switching units
    if (value === 'imperial' && localHeight) {
      const cm = Number(localHeight);
      setImperialUnit(metricToImperial(cm));
      // clear metric input
      setLocalHeight('');
    } else if (value === 'metric' && (imperialUnit.feet || imperialUnit.inches)) {
      const cm = imperialToMetric(imperialUnit.feet, imperialUnit.inches);
      setLocalHeight(Math.round(cm).toString());
      setImperialUnit({ feet: 0, inches: 0 });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(requestAnimationFrame);
    try {
      const heightToSave =
        localUnitSystem === 'metric'
          ? localHeight
            ? Number(localHeight)
            : 0
          : imperialToMetric(imperialUnit.feet, imperialUnit.inches);

      const weightToSave = localWeight ? Number(localWeight) : 0;

      dispatch(setWeight(weightToSave));
      dispatch(setHeight(heightToSave));
      dispatch(setUnitSystem(localUnitSystem));
      if (localLanguage) dispatch(setLanguage(localLanguage));
      if (localCountdownVoice) dispatch(setCountdownVoice(localCountdownVoice));

      router.push('/(tabs)/home');
    } catch (error) {
      console.log('error saving user preferences, ', error);
    } finally {
      setLoading(false);
    }
  };

  function changeNavigationTitle() {
    navigation.setOptions({ title: `${t('settings_screen.settings')}` });
  }

  useEffect(() => {
    changeNavigationTitle();
  }, [navigation]);

  // in case unit system changes somewhere in the future
  useEffect(() => {
    setLocalUnitSystem(currentUnitSystem);
  }, [currentUnitSystem]);

  return (
    <View className="flex-1 items-center gap-5 bg-secondary/30 p-6">
      <Card className="w-full max-w-sm rounded-2xl p-6">
        <CardHeader>
          <CardTitle className="textl-xl text-center uppercase sm:text-left">
            {t('settings_screen.settings')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-base font-semibold">
          {/* unit system */}
          <Label nativeID="units">{t('settings_screen.unit_system.label')}</Label>
          <ToggleGroup
            value={localUnitSystem}
            onValueChange={handleUnitSystemChange}
            variant="outline"
            type="single"
            size="lg">
            <ToggleGroupItem isFirst value="metric" aria-label="Toggle Metric">
              <Text>{t('settings_screen.unit_system.metric')}</Text>
            </ToggleGroupItem>
            <ToggleGroupItem value="imperial" aria-label="Toggle Imperial">
              <Text>{t('settings_screen.unit_system.imperial')}</Text>
            </ToggleGroupItem>
          </ToggleGroup>

          {/*weight*/}
          <Label nativeID="weight" className="pt-2">
            {t('settings_screen.weight')} (kg)
          </Label>
          <Input
            placeholder="Weight..."
            aria-labelledby="weight"
            aria-errormessage="inputError"
            keyboardType="numeric"
            value={localWeight}
            onChangeText={handleWeightChange}
          />

          {/*height metric*/}
          {localUnitSystem === 'metric' ? (
            <View>
              <Label nativeID="heigth" className="pt-2">
                {t('settings_screen.height')} (cm)
              </Label>
              <Input
                placeholder="height..."
                aria-labelledby="height"
                aria-errormessage="inputError"
                keyboardType="numeric"
                value={localHeight}
                onChangeText={handleHeightChange}
              />
            </View>
          ) : (
            <View className="flex flex-row items-center gap-2">
              <View className="flex-1">
                <Label nativeID="heigth" className="pt-2">
                  feet (ft)
                </Label>
                <Input
                  placeholder="height..."
                  aria-labelledby="height"
                  aria-errormessage="inputError"
                  keyboardType="numeric"
                  value={imperialUnit.feet.toString()}
                  onChangeText={(feet) => handleInputChange('feet', parseInt(feet))}
                  selectTextOnFocus={true}
                  className="h-12"
                />
              </View>
              <View className="flex-1">
                <Label nativeID="heigth" className="pt-2">
                  inches (inch)
                </Label>
                <Input
                  placeholder="height..."
                  aria-labelledby="height"
                  aria-errormessage="inputError"
                  keyboardType="numeric"
                  value={imperialUnit.inches.toString()}
                  onChangeText={(inches) => handleInputChange('inches', parseInt(inches))}
                  selectTextOnFocus={true}
                  className="h-12"
                />
              </View>
            </View>
          )}

          {/*app language*/}
          <Label nativeID="heigth" className="pt-2 capitalize">
            {t('settings_screen.app_language')}
          </Label>
          <Select
            id="language"
            value={languageOptions.find((opt) => opt.value === localLanguage)}
            onValueChange={handleLanguageChange}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Languages</SelectLabel>
                {languageOptions.map((lang) => (
                  <SelectItem key={lang.value} label={lang.label} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/*countdown voice*/}
          <Label nativeID="heigth" className="pt-2 capitalize">
            {t('settings_screen.countdown_voice')}
          </Label>
          <Select
            id="countdownVoice"
            value={countdownVoiceOptions.find((opt) => opt.value === localCountdownVoice)}
            onValueChange={handleCountdownVoiceChange}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Countdown Voice</SelectLabel>
                {countdownVoiceOptions.map((countdown_voice) => (
                  <SelectItem
                    key={countdown_voice.value}
                    label={countdown_voice.label}
                    value={countdown_voice.value}>
                    {countdown_voice.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardContent>
        <CardFooter>
          <View className="flex-1 items-center justify-center">
            <Button onPress={handleSubmit} disabled={loading}>
              <Text>{loading ? 'Saving...' : 'Save'}</Text>
            </Button>
          </View>
        </CardFooter>
      </Card>
      <FullScreenLoader visible={loading} />
    </View>
  );
}
