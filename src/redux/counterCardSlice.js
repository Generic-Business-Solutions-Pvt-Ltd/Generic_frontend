import { createSlice } from '@reduxjs/toolkit';

const initialState = { totalOnboardEmp: 0, todayEmergency: 0 };

const counterCardSlice = createSlice({
  name: 'counterCard',
  initialState,
  reducers: {
    setTotalOnboardEmp(state, action) {
      state.totalOnboardEmp = action.payload;
    },

    setTodayEmergency(state, action) {
      state.todayEmergency = action.payload;
    },
  },
});

export const { setTotalOnboardEmp, setTodayEmergency } = counterCardSlice.actions;
export default counterCardSlice.reducer;
