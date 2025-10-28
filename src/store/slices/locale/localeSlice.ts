import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initializeI18n } from '@/i18n';

export type Language = 'en' | 'es' | 'ko';

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
      // syncs the language from redux state to i18n
      initializeI18n(action.payload);
    },
  },
});

export const { setLanguage } = localeSlice.actions;
export default localeSlice.reducer;
