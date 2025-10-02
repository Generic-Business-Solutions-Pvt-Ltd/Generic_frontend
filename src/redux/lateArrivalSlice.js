import { createSlice } from '@reduxjs/toolkit';

const initialState = { previousData: [], currentData: [], days: [] };

const lateArrivalStatusSlice = createSlice({
  name: 'lateArrivalStatus',
  initialState,
  reducers: {
    setPreviousData(state, action) {
      state.previousData = action.payload;
    },

    setCurrentData(state, action) {
      state.currentData = action.payload;
    },

    setDays(state, action) {
      state.days = action.payload;
    },
  },
});

export const { setPreviousData, setCurrentData, setDays } = lateArrivalStatusSlice.actions;
export default lateArrivalStatusSlice.reducer;
