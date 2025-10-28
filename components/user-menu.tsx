import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Text } from '@/components/ui/text';
import { useAuth, useUser } from '@clerk/clerk-expo';
import type { TriggerRef } from '@rn-primitives/popover';
import { Languages, LogOutIcon, PlusIcon, SettingsIcon, Speech } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/src/store/storeSetup';
import { useDispatch } from 'react-redux';
import { Language, setLanguage } from '@/src/store/slices/locale/localeSlice';
import { CountdownVoice, setCountdownVoice } from '@/src/store/slices/settings/settingsSlice';

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

type LanguageOption = (typeof languageOptions)[number];
type CountdownVoiceOption = (typeof countdownVoiceOptions)[number];

export function UserMenu() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const popoverTriggerRef = React.useRef<TriggerRef>(null);

  const currentLanguage = useSelector((state: RootState) => state.locale.currentLanguage);
  const currentCountdownVoice = useSelector(
    (state: RootState) => state.settings.currentCountdownVoice
  );
  const dispatch = useDispatch<AppDispatch>();

  // language
  const selectedLanguage = React.useMemo<LanguageOption | undefined>(() => {
    if (!currentLanguage) return undefined;
    return languageOptions.find((opt) => opt.value === currentLanguage);
  }, [currentLanguage]);

  const handleLanguageChange = (option: { value: string; label: string } | undefined) => {
    if (option && (option.value === 'en' || option.value === 'es' || option.value === 'ko')) {
      dispatch(setLanguage(option.value as Language));
    }
  };

  // countdown voice
  const selectedCountdownVoice = React.useMemo<CountdownVoiceOption | undefined>(() => {
    if (!currentCountdownVoice) return undefined;
    return countdownVoiceOptions.find((opt) => opt.value === currentCountdownVoice);
  }, [currentCountdownVoice]);

  const handleCountdownVoiceChange = (option: { value: string; label: string } | undefined) => {
    if (
      option &&
      (option.value === 'enUS/male' ||
        option.value === 'enUS/female' ||
        option.value === 'esMX/male' ||
        option.value === 'koKR/male' ||
        option.value === 'koKR/female')
    ) {
      dispatch(setCountdownVoice(option.value as CountdownVoice));
    }
  };

  async function onSignOut() {
    popoverTriggerRef.current?.close();
    await signOut();
  }

  return (
    <Popover>
      <PopoverTrigger asChild ref={popoverTriggerRef}>
        <Button variant="ghost" size="icon" className="size-8 rounded-full">
          <UserAvatar />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" side="bottom" className="w-80 p-0">
        <View className="gap-3 border-b border-border p-3">
          <View className="flex-row items-center gap-3">
            <UserAvatar className="size-10" />
            <View className="flex-1">
              <Text className="font-medium leading-5">
                {user?.fullName || user?.emailAddresses[0]?.emailAddress}
              </Text>
              {user?.fullName?.length ? (
                <Text className="text-sm font-normal leading-4 text-muted-foreground">
                  {user?.username || user?.emailAddresses[0]?.emailAddress}
                </Text>
              ) : null}
            </View>
          </View>
          <View className="flex-row flex-wrap gap-3 py-0.5">
            <Button
              variant="outline"
              size="sm"
              onPress={() => {
                // TODO: Navigate to account settings screen
              }}>
              <Icon as={SettingsIcon} className="size-4" />
              <Text>Manage Account</Text>
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onPress={onSignOut}>
              <Icon as={LogOutIcon} className="size-4" />
              <Text>Sign Out</Text>
            </Button>
          </View>
          {/*app language*/}
          <View className="flex flex-row">
            <View className="size-10 items-center justify-center">
              <Icon as={Languages} className="size-5" />
            </View>
            <Select id="language" value={selectedLanguage} onValueChange={handleLanguageChange}>
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
          </View>
          {/*countdown voice*/}
          <View className="flex flex-row">
            <View className="size-10 items-center justify-center">
              <Icon as={Speech} className="size-5" />
            </View>
            <Select
              id="countdownVoice"
              value={selectedCountdownVoice}
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
          </View>
        </View>
        <Button
          variant="ghost"
          size="lg"
          className="h-16 justify-start gap-3 rounded-none rounded-b-md px-3 sm:h-14"
          onPress={() => {
            // TODO: Navigate to add account screen
          }}>
          <View className="size-10 items-center justify-center">
            <View className="size-7 items-center justify-center rounded-full border border-dashed border-border bg-muted/50">
              <Icon as={PlusIcon} className="size-5" />
            </View>
          </View>
          <Text>Add account</Text>
        </Button>
      </PopoverContent>
    </Popover>
  );
}

function UserAvatar(props: Omit<React.ComponentProps<typeof Avatar>, 'alt'>) {
  const { user } = useUser();

  const { initials, imageSource, userName } = React.useMemo(() => {
    const userName = user?.fullName || user?.emailAddresses[0]?.emailAddress || 'Unknown';
    const initials = userName
      .split(' ')
      .map((name) => name[0])
      .join('');

    const imageSource = user?.imageUrl ? { uri: user.imageUrl } : undefined;
    return { initials, imageSource, userName };
  }, [user?.imageUrl, user?.fullName, user?.emailAddresses[0]?.emailAddress]);

  return (
    <Avatar alt={`${userName}'s avatar`} {...props}>
      <AvatarImage source={imageSource} />
      <AvatarFallback>
        <Text>{initials}</Text>
      </AvatarFallback>
    </Avatar>
  );
}
