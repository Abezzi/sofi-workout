import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Weight = 'kg' | 'lb';
export type CountdownVoice =
  | 'enUS/male'
  | 'enUS/female'
  | 'esMX/male'
  | 'koKR/male'
  | 'koKR/female';

type SettingsState = {
  currentWeight: Weight | null;
  currentCountdownVoice: CountdownVoice;
};

const initialState: SettingsState = {
  currentWeight: 'kg',
  currentCountdownVoice: 'enUS/male',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setWeight: (state, action: PayloadAction<Weight>) => {
      state.currentWeight = action.payload;
    },
    setCountdownVoice: (state, action: PayloadAction<CountdownVoice>) => {
      state.currentCountdownVoice = action.payload;
    },
  },
});

export const { setWeight } = settingsSlice.actions;
export const { setCountdownVoice } = settingsSlice.actions;
export default settingsSlice.reducer;
