import { combineReducers } from '@reduxjs/toolkit';
import timerReducer from './slices/workout/timerSlice';
import localeReducer from './slices/locale/localeSlice';
import settingsReducer from './slices/settings/settingsSlice';

const rootReducer = combineReducers({
  timer: timerReducer,
  locale: localeReducer,
  settings: settingsReducer,
});

export default rootReducer;
