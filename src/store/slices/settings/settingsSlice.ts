import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Weight = 'kg' | 'lb';
type CountdownVoice = 'male-enUS' | 'female-enUS' | 'male-esMX' | 'male-koKR' | 'female-koKR';

type SettingsState = {
  currentWeight: Weight | null;
  currentCountdownVoice: CountdownVoice;
};

const initialState: SettingsState = {
  currentWeight: 'kg',
  currentCountdownVoice: 'male-enUS',
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
