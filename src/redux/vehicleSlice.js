import { APIURL } from '../constants';
import { ApiService } from '../services';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  vehicles: { data: [] },
  newDevices: [],
  offlineVehicle: [],
  loading: false,
  error: null,
};

const getOneHourAgo = () => Date.now() - 60 * 60 * 1000;

export const fetchVehicles = createAsyncThunk('vehicles/fetchVehicles', async (params = {}, thunkAPI) => {
  try {
    const response = await ApiService.get(APIURL.VEHICLE, params);
    return response;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const vehicleReducer = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {
    fetchLastVehicles: (state, action) => {
      const dataFromRedis = action.payload;
      state.vehicles.data = state.vehicles.data.map((vehicle) => {
        const match = dataFromRedis.find((d) => d.data && d.data.imei === vehicle.imei_number);
        return match?.data ? { ...vehicle, ...match.data } : vehicle;
      });
      state.newDevices = state.vehicles.data.filter((v) => !('latitude' in v));
      const oneHourAgo = getOneHourAgo();
      state.offlineVehicle = state.vehicles.data.filter((v) => v.timestamp < oneHourAgo);
    },

    updatedData: (state, action) => {
      const payload = JSON.parse(action.payload);
      const updatedIMEI = payload.imei;
      let isUpdated = false;
      state.vehicles.data = state.vehicles.data.map((vehicle) => {
        if (vehicle.imei_number === updatedIMEI) {
          isUpdated = true;
          const { imei, ...rest } = payload;
          return { ...vehicle, ...rest };
        }
        return vehicle;
      });
      if (isUpdated) {
        const idx = state.newDevices.findIndex((v) => v.imei_number === updatedIMEI);
        if (idx !== -1) state.newDevices.splice(idx, 1);
        const oneHourAgo = getOneHourAgo();
        state.offlineVehicle = state.vehicles.data.filter((v) => v.timestamp < oneHourAgo);
      }
    },

    checkOfflineVehicles: (state) => {
      const now = Date.now();
      const oneHourMs = 60 * 60 * 1000;
      state.offlineVehicle = state.vehicles.data.filter((v) => {
        const t = new Date(v.lastUpdated).getTime();
        return now - t > oneHourMs;
      });
      state.vehicles.data = state.vehicles.data.filter((v) => {
        const t = new Date(v.lastUpdated).getTime();
        return now - t < oneHourMs;
      });
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        const vehicles = action.payload?.data?.vehicles || action.payload?.data || action.payload || [];
        state.vehicles.data = vehicles;
        state.newDevices = vehicles.map((v) => ({ imei_number: v.imei_number }));
        state.loading = false;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch vehicles';
      });
  },
});

export const { fetchLastVehicles, updatedData, checkOfflineVehicles } = vehicleReducer.actions;
export default vehicleReducer.reducer;
