import { createSlice } from "@reduxjs/toolkit";

const initialState = { previousData: [], currentData: [], days: [] };

//for employee onboard dashboard
const distanceCoverStatusSlice = createSlice({
  name: "distanceCoverStatus",
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

export const { setPreviousData, setCurrentData, setDays } =
  distanceCoverStatusSlice.actions;
export default distanceCoverStatusSlice.reducer;
