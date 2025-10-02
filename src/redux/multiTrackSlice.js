import { createSlice } from '@reduxjs/toolkit';
import { processVehicles } from '../utils/vehicleStatus';

const initialState = {
  devices: [],
  runningDevices: [],
  parkedDevices: [],
  idelDevices: [],
  offlineVehicleData: [],
  activeTab: 'All',
  isTrackShow: false,
  isProcessed: false,
};

const multiTrackStatuSlice = createSlice({
  name: 'multiTrackStatus',
  initialState,
  reducers: {
    setDevices(state, action) {
      state.devices = action.payload;
    },

    setRunningDevices(state, action) {
      state.runningDevices = action.payload;
    },

    setParkedDevices(state, action) {
      state.parkedDevices = action.payload;
    },
    setIdelDevices(state, action) {
      state.idelDevices = action.payload;
    },

    setActiveTab(state, action) {
      state.activeTab = action.payload;
    },

    setOfflineVehicleData(state, action) {
      state.offlineVehicleData = action.payload;
    },

    setIsTrackShow(state, action) {
      state.isTrackShow = action.payload;
    },

    setProcessedVehicles(state, action) {
      const result = processVehicles(action.payload);
      state.devices = result.devices;
      state.runningDevices = result.runningDevices;
      state.idelDevices = result.idelDevices;
      state.parkedDevices = result.parkedDevices;
      state.offlineVehicleData = result.offlineVehicleData;
      state.isProcessed = true;
    },
  },
});

export const {
  setDevices,
  setRunningDevices,
  setParkedDevices,
  setIdelDevices,
  setActiveTab,
  setOfflineVehicleData,
  setIsTrackShow,
  setProcessedVehicles,
} = multiTrackStatuSlice.actions;
export default multiTrackStatuSlice.reducer;
