import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Language = 'en' | 'es';

type LocaleState = {
  currentLanguage: Language | null;
};

const initialState: LocaleState = {
  currentLanguage: 'en',
};

const localeSlice = createSlice({
  name: 'locale',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.currentLanguage = action.payload;
    },
  },
});

export const { setLanguage } = localeSlice.actions;
export default localeSlice.reducer;
