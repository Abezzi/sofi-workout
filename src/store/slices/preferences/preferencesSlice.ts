import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Weight = 'kg' | 'lb';

type LocaleState = {
  currentWeight: Weight | null;
};

const initialState: LocaleState = {
  currentWeight: 'kg',
};

const localeSlice = createSlice({
  name: 'locale',
  initialState,
  reducers: {
    setWeight: (state, action: PayloadAction<Weight>) => {
      state.currentWeight = action.payload;
    },
  },
});

export const { setWeight } = localeSlice.actions;
export default localeSlice.reducer;
