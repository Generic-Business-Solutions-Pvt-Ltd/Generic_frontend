import { createSlice } from '@reduxjs/toolkit';

const initialState = { previousData: [], currentData: [], days: [] };
//for overspeed violation dashboard
const overspeedStatusSlice = createSlice({
  name: 'overspeedStatus',
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

export const { setPreviousData, setCurrentData, setDays } = overspeedStatusSlice.actions;
export default overspeedStatusSlice.reducer;
