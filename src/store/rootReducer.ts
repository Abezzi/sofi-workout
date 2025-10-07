import { combineReducers } from '@reduxjs/toolkit';
import timerReducer from './slices/workout/timerSlice';
import localeReducer from './slices/locale/localeSlice';

const rootReducer = combineReducers({
  timer: timerReducer,
  locale: localeReducer,
});

export default rootReducer;
