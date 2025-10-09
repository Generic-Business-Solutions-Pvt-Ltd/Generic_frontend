import L from 'leaflet';
import AutoFlyTo from './AutoFly';
import { APIURL } from '../../../../constants';
import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AddressServices, ApiService } from '../../../../services';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Autocomplete, TextField, FormControl, RadioGroup, FormControlLabel, Radio } from '@mui/material';

const customIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854878.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const shifts = [
  { id: '2f7d76b8-87a9-4dc1-822a-a39e99b314e9', name: 'Night' },
  { id: '1b0b7594-c88c-470b-a956-f8f79918fd36', name: 'Day' },
];

const FitBounds = ({ stopPoints }) => {
  const map = useMap();
  const bounds = stopPoints.map((s) => [+s.latitude, +s.longitude]).filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng));

  useEffect(() => {
    if (bounds.length) map.fitBounds(bounds, { padding: [50, 50] });
    // eslint-disable-next-line
  }, [JSON.stringify(bounds), map]);

  return null;
};

const getVehicleNumber = (rowData = {}) => {
  return (
    rowData.vehicle_number ||
    rowData.busNumber ||
    rowData.vehicle?.vehicle_number ||
    rowData.vehicle?.vehicle_name ||
    rowData.vehicle?.vehicleNumber ||
    ''
  );
};

const getDriverName = (rowData = {}) => {
  return rowData.busDriver || rowData.vehicle?.driver || '';
};

const getCreatedAt = (rowData = {}) => rowData.createdAt || rowData.created_at || '';
const getRouteName = (rowData = {}) => rowData?.routeName || rowData?.name || '';
const getVehicleId = (rowData = {}) => rowData?.vehicleID || rowData?.vehicle_id || rowData?.vehicle?.id || '';

function toTimeInputValue(val) {
  if (!val) return '';
  // If already in HH:mm, return as is
  if (/^\d{2}:\d{2}$/.test(val)) return val;
  // If already in HH:mm:ss, return first 5 chars
  if (/^\d{2}:\d{2}:\d{2}/.test(val)) return val.slice(0, 5);
  // If ISO string, parse and format
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

const VehicleRouteForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const addressTimeoutRef = useRef();

  const rowData = location.state?.rowData || {};
  const companyID = localStorage.getItem('company_id');
  const isViewMode = location.pathname.includes('/view');
  console.log(rowData);

  const [vehicles, setVehicles] = useState([]);
  const [routeName, setRouteName] = useState('');
  const [addressOnSearch, setAddressOnSearch] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedShift, setSelectedShift] = useState(shifts[0].id);
  const [latestSelectedCoords, setLatestSelectedCoords] = useState(null);
  const [stopPoints, setStopPoints] = useState([
    { id: Date.now(), address: '', latitude: '', longitude: '', time: '', returnTime: '', distance: 0 },
  ]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await ApiService.get(`${APIURL.VEHICLE}?company_id=${companyID}&limit=500`);
        if (Array.isArray(res?.data?.vehicles)) setVehicles(res.data.vehicles);
      } catch (error) {
        console.error('Failed to fetch vehicles:', error);
      }
    };
    fetchVehicles();
  }, [companyID]);

  useEffect(() => {
    if (!rowData?.id) return;

    const fetchStops = async () => {
      try {
        const res = await ApiService.get(`${APIURL.VEHICLE_ROUTE}/${rowData.id}/stops`);
        if (res?.data?.stops?.length) {
          setStopPoints(
            res.data.stops.map((s) => ({
              id: s.id,
              address: s.address || '',
              latitude: s.latitude || '',
              longitude: s.longitude || '',
              time: toTimeInputValue(s.time || ''),
              returnTime: toTimeInputValue(s.return_time || ''),
              distance: s.distance || 0,
            }))
          );
        }
      } catch (error) {
        console.error('Failed to fetch stops:', error);
      }
    };

    fetchStops();
  }, [rowData?.id]);

  useEffect(() => {
    if (!rowData) return;
    const vehicleId = getVehicleId(rowData);
    if (vehicleId && vehicles.length > 0) {
      const foundVehicle = vehicles.find((v) => v.id === vehicleId);
      if (foundVehicle) {
        setSelectedVehicle({
          value: foundVehicle.id,
          label:
            foundVehicle.vehicle?.vehicle_number ||
            foundVehicle.vehicle_number ||
            foundVehicle.vehicle_name ||
            foundVehicle.label ||
            '',
        });
      }
    }
    setRouteName(getRouteName(rowData));

    setSelectedShift(
      rowData.shiftId || rowData.shift_id || (rowData.stops && rowData.stops[0]?.shift_id) || shifts[0].id
    );

    if (Array.isArray(rowData.Vehicle_Route_Stops) && rowData.Vehicle_Route_Stops.length > 0) {
      setStopPoints(
        rowData.Vehicle_Route_Stops.map((s) => ({
          id: s.id || Date.now() + Math.random(),
          address: s.address || '',
          latitude: s.latitude || '',
          longitude: s.longitude || '',
          time: toTimeInputValue(s.time || ''),
          returnTime: toTimeInputValue(s.return_time || ''),
          distance: s.distance || 0,
        }))
      );
    } else if (
      Array.isArray(rowData.stops) &&
      rowData.stops.length > 0 &&
      (rowData.stops[0].address || rowData.stops[0].latitude)
    ) {
      setStopPoints(
        rowData.stops.map((s) => ({
          id: s.id || Date.now() + Math.random(),
          address: s.address || '',
          latitude: s.latitude || '',
          longitude: s.longitude || '',
          time: toTimeInputValue(s.time || ''),
          returnTime: toTimeInputValue(s.return_time || ''),
          distance: s.distance || 0,
        }))
      );
    }
    // eslint-disable-next-line
  }, [JSON.stringify(rowData), JSON.stringify(vehicles)]);

  const handleStopChange = (idx, key, value) => {
    setStopPoints((prevStops) => {
      const newStops = [...prevStops];
      if (key === 'time' || key === 'returnTime') {
        if (typeof value === 'string' && value.length > 5) value = value.slice(0, 5);
      }
      newStops[idx] = { ...newStops[idx], [key]: value };
      if (
        ['latitude', 'longitude'].includes(key) &&
        !isNaN(+newStops[idx].latitude) &&
        !isNaN(+newStops[idx].longitude)
      ) {
        setLatestSelectedCoords({ lat: +newStops[idx].latitude, lng: +newStops[idx].longitude });
      }
      return newStops;
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      company_id: companyID,
      vehicle_id: selectedVehicle?.value,
      name: routeName,
      status_id: 1,
      shift_id: selectedShift,
      Vehicle_Route_Stops: stopPoints.map((s) => ({
        company_id: companyID,
        shift_id: selectedShift,
        latitude: s.latitude,
        longitude: s.longitude,
        address: s.address,
        time: s.time ? s.time : '',
        return_time: s.returnTime ? s.returnTime : '',
        distance: s.distance,
      })),
    };

    try {
      const id = rowData?.routeID || rowData?.id;
      let res;
      if (rowData?.id) {
        res = await ApiService.put(`${APIURL.VEHICLE_ROUTE}/${id}?company_id=${companyID}`, payload);
        if (res.success) {
          alert('Route updated successfully!');
          navigate('/management/vehicle-route');
        }
      } else {
        res = await ApiService.post(APIURL.VEHICLE_ROUTE, payload);
        if (res.success) {
          alert('Route created successfully!');
          navigate('/management/vehicle-route');
        }
      }
    } catch (error) {
      console.error(error);
      alert('Something went wrong!');
    }
  };

  const vehicleOptions = vehicles.map((v) => ({
    label:
      v.vehicle?.vehicle_number ||
      v.vehicle?.vehicle_name ||
      v.vehicle_number ||
      v.vehicle_name ||
      v.busNumber ||
      v.label,
    value: v.id,
  }));

  const initialCenter =
    stopPoints.length && !isNaN(+stopPoints[0]?.latitude) && !isNaN(+stopPoints[0]?.longitude)
      ? [+stopPoints[0].latitude, +stopPoints[0].longitude]
      : [12.932, 12.932];

  const addressOptions = Array.isArray(addressOnSearch) ? addressOnSearch : addressOnSearch ? [addressOnSearch] : [];

  return (
    <div>
      <div className='flex justify-between items-center p-2'>
        <h1 className='text-2xl font-bold mb-3 text-[#07163d]'>Vehicle Route</h1>
      </div>
      <form onSubmit={handleFormSubmit} className='grid gap-3'>
        <div className='bg-white p-4 border-t-3 border-[#07163d] rounded-sm'>
          <div className='grid md:grid-cols-2 gap-3 my-2'>
            {isViewMode ? (
              <>
                <div className='flex flex-col'>
                  <label className='block mb-2 text-sm font-semibold text-gray-900'>Vehicle</label>
                  <TextField size='small' type='text' value={getVehicleNumber(rowData)} disabled fullWidth />
                </div>
                <div className='flex flex-col'>
                  <label className='block mb-2 text-sm font-semibold text-gray-900'>Route Name</label>
                  <TextField size='small' type='text' value={getRouteName(rowData)} disabled fullWidth />
                </div>
              </>
            ) : (
              <>
                <div className='flex flex-col'>
                  <label className='block mb-2 text-sm font-semibold text-gray-900'>Vehicle</label>
                  <Autocomplete
                    disablePortal
                    options={vehicleOptions}
                    value={
                      selectedVehicle
                        ? vehicleOptions.find((o) => o.value === selectedVehicle.value) || selectedVehicle
                        : null
                    }
                    isOptionEqualToValue={(o, v) => o.value === v?.value}
                    getOptionLabel={(o) => o?.label || ''}
                    size='small'
                    renderInput={(params) => <TextField {...params} placeholder='Select Vehicle' />}
                    onChange={(_, v) => setSelectedVehicle(v)}
                  />
                </div>
                <div className='flex flex-col'>
                  <label className='block mb-2 text-sm font-semibold text-gray-900'>Route Name</label>
                  <TextField
                    size='small'
                    type='text'
                    placeholder='Type Route Name Here'
                    fullWidth
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
          {isViewMode && rowData && (
            <div className='col-span-2 py-2 grid grid-cols-4 gap-4 mt-2'>
              <div>
                <b>Route Name:</b> {getRouteName(rowData)}
              </div>
              <div>
                <b>Vehicle Number:</b> {getVehicleNumber(rowData)}
              </div>
              <div>
                <b>Driver:</b> {getDriverName(rowData)}
              </div>
              <div>
                <b>Created At:</b> {getCreatedAt(rowData)}
              </div>
            </div>
          )}
        </div>

        <div className='bg-white p-4 rounded-sm border-t-3 border-[#07163d]'>
          {isViewMode ? (
            <div className='mb-4'>
              <label className='block mb-2 text-sm font-semibold text-gray-900'>Shift</label>
              <TextField
                size='small'
                type='text'
                value={shifts.find((s) => String(s.id) === String(selectedShift))?.name || shifts[0].name}
                disabled
                fullWidth
              />
            </div>
          ) : (
            <FormControl component='fieldset'>
              <label className='block mb-2 text-sm font-semibold text-gray-900'>Select Shift *</label>
              <RadioGroup row value={String(selectedShift)} onChange={(e) => setSelectedShift(e.target.value)}>
                {shifts.map((s) => (
                  <FormControlLabel
                    key={s.id}
                    value={String(s.id)}
                    control={<Radio />}
                    label={<span className='text-sm font-medium'>{s.name}</span>}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}

          {stopPoints.map((stop, idx) => (
            <div key={stop.id} className='grid grid-cols-8 gap-2 items-center my-3 w-full'>
              <div className='flex flex-col col-span-2'>
                <label className='block mb-2 text-sm font-semibold text-gray-900'>Address</label>
                {isViewMode ? (
                  <TextField size='small' type='text' value={stop.address} disabled fullWidth />
                ) : (
                  <Autocomplete
                    freeSolo
                    disablePortal
                    options={addressOptions.map((i) => ({
                      label: i.display_name,
                      value: i.place_id,
                      otherData: i,
                    }))}
                    getOptionLabel={(o) => (typeof o === 'string' ? o : o?.label || '')}
                    size='small'
                    value={
                      addressOptions.find((opt) => opt.display_name === stop.address)
                        ? { label: stop.address }
                        : stop.address || ''
                    }
                    renderInput={(params) => <TextField {...params} placeholder='Search Address' />}
                    onInputChange={(e, value, reason) => {
                      if (reason === 'input') {
                        if (addressTimeoutRef.current) clearTimeout(addressTimeoutRef.current);
                        addressTimeoutRef.current = setTimeout(async () => {
                          if (!value) return setAddressOnSearch([]);
                          try {
                            const res = await AddressServices.searchAddress(value);
                            setAddressOnSearch(res.data || []);
                          } catch (error) {
                            console.error('Address search failed:', error);
                          }
                        }, 500);
                      }
                    }}
                    onChange={(_, value) => {
                      if (!value) return;
                      if (typeof value === 'string') {
                        handleStopChange(idx, 'address', value);
                      } else {
                        handleStopChange(idx, 'address', value.label || '');
                        if (value.otherData) {
                          handleStopChange(idx, 'latitude', value.otherData.lat);
                          handleStopChange(idx, 'longitude', value.otherData.lon);
                        }
                      }
                    }}
                  />
                )}
              </div>

              <TextField
                label='Latitude'
                size='small'
                type='number'
                value={stop.latitude}
                disabled={isViewMode}
                onChange={(e) => handleStopChange(idx, 'latitude', e.target.value)}
              />

              <TextField
                label='Longitude'
                size='small'
                type='number'
                value={stop.longitude}
                disabled={isViewMode}
                onChange={(e) => handleStopChange(idx, 'longitude', e.target.value)}
              />

              <TextField
                label='Time'
                size='small'
                type='time'
                value={toTimeInputValue(stop.time)}
                disabled={isViewMode}
                onChange={(e) => handleStopChange(idx, 'time', e.target.value)}
                inputProps={{ step: 60 }}
              />

              <TextField
                label='Return Time'
                size='small'
                type='time'
                value={toTimeInputValue(stop.returnTime)}
                disabled={isViewMode}
                onChange={(e) => handleStopChange(idx, 'returnTime', e.target.value)}
                inputProps={{ step: 60 }}
              />

              <TextField
                label='Distance'
                size='small'
                type='number'
                value={stop.distance}
                disabled={isViewMode}
                onChange={(e) => handleStopChange(idx, 'distance', e.target.value)}
              />

              {!isViewMode && stopPoints.length > 1 && (
                <button
                  type='button'
                  className='bg-red-500 text-white p-1 rounded'
                  onClick={() => setStopPoints((prev) => prev.filter((_, i) => i !== idx))}>
                  Remove
                </button>
              )}
            </div>
          ))}

          {!isViewMode && (
            <button
              type='button'
              className='bg-green-500 text-white px-4 py-2 rounded mt-2'
              onClick={() =>
                setStopPoints((prev) => [
                  ...prev,
                  { id: Date.now(), address: '', latitude: '', longitude: '', time: '', returnTime: '', distance: 0 },
                ])
              }>
              Add Stop
            </button>
          )}
        </div>

        <div className='h-[400px] w-full my-3 rounded-sm overflow-hidden'>
          <MapContainer center={initialCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
            {stopPoints.map((s) =>
              s.latitude && s.longitude ? (
                <Marker key={s.id} position={[+s.latitude, +s.longitude]} icon={customIcon}>
                  <Popup>{s.address}</Popup>
                </Marker>
              ) : null
            )}
            <FitBounds stopPoints={stopPoints} />
            {latestSelectedCoords && <AutoFlyTo coords={latestSelectedCoords} />}
          </MapContainer>
        </div>

        {!isViewMode && (
          <button type='submit' className='bg-[#07163d] text-white py-2 px-4 rounded hover:opacity-90'>
            {rowData?.id ? 'Update Route' : 'Create Route'}
          </button>
        )}
      </form>
    </div>
  );
};

export default VehicleRouteForm;
