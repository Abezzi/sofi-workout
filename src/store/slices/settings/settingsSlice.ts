import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UnitSystem = 'metric' | 'imperial';
export type CountdownVoice =
  | 'enUS/male'
  | 'enUS/female'
  | 'esMX/male'
  | 'koKR/male'
  | 'koKR/female';

type SettingsState = {
  currentWeight: number | null;
  currentHeight: number | null;
  currentUnitSystem: UnitSystem;
  currentCountdownVoice: CountdownVoice;
};

const initialState: SettingsState = {
  currentWeight: 80,
  currentHeight: 180,
  currentUnitSystem: 'metric',
  currentCountdownVoice: 'enUS/male',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setWeight: (state, action: PayloadAction<number>) => {
      state.currentWeight = action.payload;
    },
    setHeight: (state, action: PayloadAction<number>) => {
      state.currentHeight = action.payload;
    },
    setUnitSystem: (state, action: PayloadAction<UnitSystem>) => {
      state.currentUnitSystem = action.payload;
    },
    setCountdownVoice: (state, action: PayloadAction<CountdownVoice>) => {
      state.currentCountdownVoice = action.payload;
    },
  },
});

export const { setWeight, setHeight, setUnitSystem, setCountdownVoice } = settingsSlice.actions;
export default settingsSlice.reducer;
