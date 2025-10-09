import L from 'leaflet';
import { APIURL } from '../../../../constants';
import { useDropdownOpt } from '../../../../hooks/useDropdownOpt';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AddressServices, ApiService } from '../../../../services';
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Autocomplete, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField } from '@mui/material';

const customIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854878.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const initialFormVal = {
  firstName: '',
  lastName: '',
  employeeId: '',
  punchId: '',
  email: '',
  phoneNumber: '',
  selectedDepartment: '',
  selectedPlant: '',
  dateOfJoining: '',
  dateOfBirth: '',
  selectedGender: '',
  vehicleRoute: '',
  boardingPoint: '',
  profilePhoto: '',
  address: '',
  latitude: '',
  longitude: '',
};

const isValidLatLng = (lat, lng) => {
  const a = Number(lat),
    b = Number(lng);
  return !isNaN(a) && !isNaN(b) && a && b && a >= -90 && a <= 90 && b >= -180 && b <= 180;
};
const formatLatLng = (v) =>
  v === undefined || v === null || v === '' ? '' : isNaN(Number(v)) ? '' : Number(v).toFixed(7);

function MapClickHandler({ onMapClick, disabled }) {
  useMapEvents({
    click: (e) => {
      if (!disabled && typeof onMapClick === 'function') onMapClick(e.latlng);
    },
  });
  return null;
}

function EmployeeForm() {
  const navigate = useNavigate(),
    location = useLocation(),
    rowData = location.state;
  const companyID = localStorage.getItem('company_id');
  const fileInputRef = useRef(null),
    addressTimeoutRef = useRef(null);
  const [formVal, setFormVal] = useState(initialFormVal);
  const [addressOnSearch, setAddressOnSearch] = useState([]);
  const [selectedAddressOption, setSelectedAddressOption] = useState(null);

  const departmentDropdown = useDropdownOpt({
    apiUrl: APIURL.DEPARTMENTS,
    queryParams: { company_id: companyID },
    dataKey: 'departments',
    labelSelector: (d) => d?.department_name ?? '',
    valueSelector: (d) => d.id,
  });
  const plantDropdown = useDropdownOpt({
    apiUrl: APIURL.PLANTS,
    dataKey: 'plants',
    queryParams: { company_id: companyID },
    labelSelector: (d) => `${d?.plant_name}`,
    valueSelector: (d) => d.id,
  });
  const routeDropdown = useDropdownOpt({
    apiUrl: APIURL.VEHICLE_ROUTE,
    dataKey: 'routes',
    queryParams: { company_id: companyID },
    labelSelector: (d) => `${d.name}`,
    valueSelector: (d) => d.id,
  });
  const bordingDropdown = useDropdownOpt({
    apiUrl: formVal.vehicleRoute ? `${APIURL.VEHICLE_ROUTE}/${formVal.vehicleRoute}/stops` : null,
    labelSelector: (d) => `${d.address}`,
    valueSelector: (d) => d.id,
    dataKey: 'stops',
  });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormVal((prev) => ({
      ...prev,
      [name]: name === 'latitude' || name === 'longitude' ? (value === '' ? '' : formatLatLng(value)) : value,
    }));
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) setFormVal((prev) => ({ ...prev, profilePhoto: e.dataTransfer.files[0] }));
    e.dataTransfer.clearData();
  }, []);
  const handleDragOver = useCallback((e) => e.preventDefault(), []);

  useEffect(() => {
    if (rowData && (rowData.mode === 'edit' || rowData.mode === 'view')) {
      const d = rowData.rowData;
      const firstName = d.first_name || (d.employeeName?.split(' ')[0] ?? '');
      const lastName = d.last_name || (d.employeeName?.split(' ')[1] ?? '');
      const lat = d.boarding_latitude,
        lng = d.boarding_longitude;
      const validLatLng =
        lat !== undefined &&
        lng !== undefined &&
        lat !== null &&
        lng !== null &&
        lat !== '' &&
        lng !== '' &&
        !isNaN(Number(lat)) &&
        !isNaN(Number(lng)) &&
        Number(lat) !== 0 &&
        Number(lng) !== 0;
      setFormVal({
        firstName,
        lastName,
        employeeId: d.employee_id || '',
        punchId: d.punch_id || '',
        email: d.email || '',
        phoneNumber: d.phone_number || '',
        selectedDepartment: d.departmentId || '',
        selectedPlant: d.plantId || '',
        dateOfJoining: d.doj || '',
        dateOfBirth: d.dob || '',
        selectedGender: d.gender === 'Male' ? '2' : d.gender === 'Female' ? '1' : '',
        vehicleRoute: d.vehicle_route_id || '',
        boardingPoint: d.boarding_address || '',
        profilePhoto: null,
        address: d.address || '',
        latitude: validLatLng ? formatLatLng(lat) : '',
        longitude: validLatLng ? formatLatLng(lng) : '',
      });
      setSelectedAddressOption(
        d.address && validLatLng
          ? {
              label: d.address,
              value: `${formatLatLng(lat)}-${formatLatLng(lng)}`,
              otherData: { display_name: d.address, lat: formatLatLng(lat), lon: formatLatLng(lng) },
            }
          : null
      );
    }
  }, [rowData]);

  const handleFormSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const latitude = formVal.latitude === '' ? '' : Number(formVal.latitude).toFixed(7);
      const longitude = formVal.longitude === '' ? '' : Number(formVal.longitude).toFixed(7);
      const payload = {
        first_name: formVal.firstName,
        last_name: formVal.lastName,
        employee_id: formVal.employeeId,
        punch_id: formVal.punchId,
        email: formVal.email,
        phone_number: formVal.phoneNumber,
        department_id: formVal.selectedDepartment,
        plant_id: formVal.selectedPlant,
        date_of_joining: formVal.dateOfJoining,
        date_of_birth: formVal.dateOfBirth,
        gender: formVal.selectedGender,
        vehicle_route_id: formVal.vehicleRoute,
        boarding_address: formVal.boardingPoint,
        profile_img: formVal.profilePhoto?.name,
        latitude: latitude === '' ? '' : parseFloat(latitude),
        longitude: longitude === '' ? '' : parseFloat(longitude),
        address: formVal.address,
        boarding_latitude: latitude === '' ? '' : parseFloat(latitude),
        boarding_longitude: longitude === '' ? '' : parseFloat(longitude),
        status_id: 1,
      };
      let res = rowData
        ? await ApiService.put(`${APIURL.EMPLOYEE}/${rowData.rowData.actual_id}?company_id=${companyID}`, payload)
        : await ApiService.post(APIURL.EMPLOYEE, payload);
      if (res?.success) navigate('/master/employee');
      else {
        alert(res?.message || 'Something went wrong.');
        console.error(res?.message);
      }
    },
    [formVal, rowData, companyID, navigate]
  );

  const getValue = (opts, v) => opts.find((opt) => opt.value === v) || null;
  const departmentValue = useMemo(
    () => getValue(departmentDropdown.options, formVal.selectedDepartment),
    [departmentDropdown.options, formVal.selectedDepartment]
  );
  const plantValue = useMemo(
    () => getValue(plantDropdown.options, formVal.selectedPlant),
    [plantDropdown.options, formVal.selectedPlant]
  );
  const routeValue = useMemo(
    () => getValue(routeDropdown.options, formVal.vehicleRoute),
    [routeDropdown.options, formVal.vehicleRoute]
  );
  const boardingValue = useMemo(
    () => getValue(bordingDropdown.options, formVal.boardingPoint),
    [bordingDropdown.options, formVal.boardingPoint]
  );

  const handleAddressInputChange = useCallback((_, value) => {
    if (addressTimeoutRef.current) clearTimeout(addressTimeoutRef.current);
    addressTimeoutRef.current = setTimeout(async () => {
      if (value.length > 0) setAddressOnSearch((await AddressServices.getLocationFromName(value)) || []);
    }, 500);
  }, []);
  const handleAddressChange = useCallback((_, newValue) => {
    setSelectedAddressOption(newValue);
    setFormVal((prev) =>
      newValue
        ? {
            ...prev,
            address: newValue.otherData.display_name,
            latitude: formatLatLng(newValue.otherData.lat),
            longitude: formatLatLng(newValue.otherData.lon),
          }
        : { ...prev, address: '', latitude: '', longitude: '' }
    );
  }, []);

  const profileImageSrc = useMemo(() => {
    if (!formVal.profilePhoto) return null;
    if (typeof formVal.profilePhoto === 'string') return formVal.profilePhoto;
    return URL.createObjectURL(formVal.profilePhoto);
  }, [formVal.profilePhoto]);

  const addressOptions = Array.isArray(addressOnSearch)
    ? addressOnSearch.map((item) => ({
        label: item.display_name,
        value: item.place_id,
        otherData: { ...item, lat: formatLatLng(item.lat), lon: formatLatLng(item.lon) },
      }))
    : [];

  const lat = formVal.latitude,
    lng = formVal.longitude,
    hasValidLatLng = isValidLatLng(lat, lng);
  const isViewMode = rowData && rowData.mode === 'view';

  const handleMapClick = useCallback(
    async ({ lat, lng }) => {
      if (isViewMode) return;
      let address = '';
      const res = await AddressServices.getLocationFromLatLng(lat, lng);
      if (Array.isArray(res) && res.length > 0) address = res[0].display_name;

      setFormVal((prev) => ({
        ...prev,
        latitude: formatLatLng(lat),
        longitude: formatLatLng(lng),
        address: address || prev.address,
      }));
      if (address)
        setSelectedAddressOption({
          label: address || `Lat: ${formatLatLng(lat)}, Lng: ${formatLatLng(lng)}`,
          value: `${formatLatLng(lat)}-${formatLatLng(lng)}`,
          otherData: { display_name: address || '', lat: formatLatLng(lat), lon: formatLatLng(lng) },
        });
    },
    [isViewMode]
  );

  // Helper for rendering TextField/Autocomplete
  const renderField = (props) => <TextField {...props} size='small' fullWidth required={props.required} />;
  // Modified renderAuto to add label for all select fields
  const renderAuto = (opts) => (
    <div>
      <label className='block mb-2 text-sm font-medium text-gray-900'>
        {opts.label} {opts.required && <span className='text-red-500'>*</span>}
      </label>
      <Autocomplete
        disablePortal
        options={opts.options}
        loading={opts.loading}
        value={opts.value}
        onChange={opts.onChange}
        isOptionEqualToValue={(o, v) => o?.value === v?.value}
        getOptionLabel={(o) => o?.label || ''}
        renderInput={(params) => renderField({ ...params, label: opts.label, required: opts.required })}
        disabled={isViewMode}
      />
    </div>
  );

  return (
    <div className='w-full h-full p-2'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Employee</h1>
      </div>
      <form onSubmit={handleFormSubmit}>
        <div className='grid grid-col-1 md:grid-cols-2 gap-3'>
          <div className='bg-white rounded-sm border-t-3 border-[#07163d]'>
            <h2 className='text-lg p-3 text-gray-700'>Employee Detail</h2>
            <hr className='border border-gray-300' />
            <div className='p-5'>
              <div className='grid grid-col-1 md:grid-cols-2 gap-3'>
                {[
                  { name: 'firstName', label: 'Employee First Name', required: true },
                  { name: 'lastName', label: 'Employee Last Name', required: true },
                  { name: 'employeeId', label: 'Employee Id', required: true },
                  { name: 'punchId', label: 'Punch Id', required: true },
                  { name: 'email', label: 'Email', type: 'email', required: true },
                  { name: 'phoneNumber', label: 'Phone Number', type: 'number', required: true },
                ].map((f) => (
                  <div key={f.name}>
                    <label className='block mb-2 text-sm font-medium text-gray-900'>
                      {f.label} {f.required && <span className='text-red-500'>*</span>}
                    </label>
                    <TextField
                      size='small'
                      type={f.type || 'text'}
                      name={f.name}
                      id={f.name}
                      fullWidth
                      required={f.required}
                      placeholder={f.label}
                      value={formVal[f.name]}
                      onChange={handleChange}
                      disabled={isViewMode}
                    />
                  </div>
                ))}
                {renderAuto({
                  options: departmentDropdown.options,
                  loading: departmentDropdown.loading,
                  value: departmentValue,
                  onChange: (_, v) => setFormVal((prev) => ({ ...prev, selectedDepartment: v ? v.value : '' })),
                  label: 'Select Department',
                  required: true,
                })}
                {departmentDropdown.error && (
                  <p className='text-red-500 text-sm mt-1'>
                    Failed to load Department.{' '}
                    <button
                      type='button'
                      onClick={departmentDropdown.refetch}
                      className='text-blue-600 underline hover:text-blue-800 transition-colors duration-200'>
                      Retry
                    </button>
                  </p>
                )}
                {renderAuto({
                  options: plantDropdown.options,
                  loading: plantDropdown.loading,
                  value: plantValue,
                  onChange: (_, v) => setFormVal((prev) => ({ ...prev, selectedPlant: v ? v.value : '' })),
                  label: 'Select Plant',
                  required: true,
                })}
                {plantDropdown.error && (
                  <p className='text-red-500 text-sm mt-1'>
                    Failed to load Plant.{' '}
                    <button
                      type='button'
                      onClick={plantDropdown.refetch}
                      className='text-blue-600 underline hover:text-blue-800 transition-colors duration-200'>
                      Retry
                    </button>
                  </p>
                )}
                {[
                  { name: 'dateOfJoining', label: 'Joining Date' },
                  { name: 'dateOfBirth', label: 'Date Of Birth' },
                ].map((f) => (
                  <div key={f.name}>
                    <label className='block mb-2 text-sm font-medium text-gray-900'>
                      {f.label} <span className='text-red-500'>*</span>
                    </label>
                    <TextField
                      size='small'
                      type='date'
                      name={f.name}
                      id={f.name}
                      fullWidth
                      required
                      placeholder={f.label}
                      value={formVal[f.name]}
                      onChange={handleChange}
                      disabled={isViewMode}
                    />
                  </div>
                ))}
                {renderAuto({
                  options: routeDropdown.options,
                  loading: routeDropdown.loading,
                  value: routeValue,
                  onChange: (_, v) => setFormVal((prev) => ({ ...prev, vehicleRoute: v ? v.value : '' })),
                  label: 'Select Route',
                  required: false,
                })}
                {routeDropdown.error && (
                  <p className='text-red-500 text-sm mt-1'>
                    Failed to load Route.{' '}
                    <button
                      type='button'
                      onClick={routeDropdown.refetch}
                      className='text-blue-600 underline hover:text-blue-800 transition-colors duration-200'>
                      Retry
                    </button>
                  </p>
                )}
                {renderAuto({
                  options: bordingDropdown.options,
                  loading: bordingDropdown.loading,
                  value: boardingValue,
                  onChange: (_, v) => setFormVal((prev) => ({ ...prev, boardingPoint: v ? v.value : '' })),
                  label: 'Select Boarding Points',
                  required: false,
                })}
                {bordingDropdown.error && (
                  <p className='text-red-500 text-sm mt-1'>
                    Failed to load Boarding Point.{' '}
                    <button
                      type='button'
                      onClick={bordingDropdown.refetch}
                      className='text-blue-600 underline hover:text-blue-800 transition-colors duration-200'>
                      Retry
                    </button>
                  </p>
                )}
                <div>
                  <FormControl>
                    <FormLabel id='gender-radio'>
                      Gender <span className='text-red-500'>*</span>
                    </FormLabel>
                    <RadioGroup
                      aria-labelledby='gender-radio'
                      value={formVal.selectedGender}
                      name='selectedGender'
                      onChange={handleChange}
                      disabled={isViewMode}>
                      <FormControlLabel value='1' control={<Radio disabled={isViewMode} />} label='Female' />
                      <FormControlLabel value='2' control={<Radio disabled={isViewMode} />} label='Male' />
                    </RadioGroup>
                  </FormControl>
                </div>
                <div>
                  <label className='block mb-2 text-sm font-medium text-gray-900'>Profile Image</label>
                  <div className='flex items-center justify-center w-full'>
                    <div
                      className='flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100'
                      onClick={() => !isViewMode && fileInputRef.current?.click()}
                      onDrop={isViewMode ? undefined : handleDrop}
                      onDragOver={isViewMode ? undefined : handleDragOver}
                      style={isViewMode ? { pointerEvents: 'none', opacity: 0.7 } : {}}>
                      <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                        <svg
                          className='w-8 h-8 mb-4 text-gray-500'
                          aria-hidden='true'
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 20 16'>
                          <path
                            stroke='currentColor'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2'
                          />
                        </svg>
                        <p className='mb-2 text-sm text-gray-500 dark:text-gray-400'>
                          <span className='font-semibold'>Click to upload</span> or drag and drop
                        </p>
                        <p className='text-xs text-gray-500 dark:text-gray-400'>
                          SVG, PNG, JPG or GIF (MAX. 800x400px)
                        </p>
                      </div>
                      <input
                        type='file'
                        className='hidden'
                        ref={fileInputRef}
                        name='profile'
                        id='profile'
                        onChange={(e) => {
                          if (e.target.files.length > 0)
                            setFormVal((prev) => ({ ...prev, profilePhoto: e.target.files[0] }));
                        }}
                        disabled={isViewMode}
                      />
                    </div>
                  </div>
                  {profileImageSrc && (
                    <img
                      src={profileImageSrc}
                      alt='Preview'
                      className='w-24 h-24 object-cover rounded-full border mt-3'
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-sm border-t-3 border-[#07163d]'>
            <h2 className='text-lg p-3 text-gray-700'>Employee Address</h2>
            <hr className='border border-gray-300' />
            <div className='p-5'>
              <div className='grid grid-col-1 md:grid-cols-1 gap-3'>
                <div>
                  <label className='block mb-2 text-sm font-medium text-gray-900'>Address</label>
                  <Autocomplete
                    disablePortal
                    options={addressOptions}
                    isOptionEqualToValue={(o, v) => o?.value === v?.value}
                    getOptionLabel={(o) => o.label}
                    size='small'
                    renderInput={(params) => <TextField {...params} placeholder='Address' label='Address' />}
                    onInputChange={handleAddressInputChange}
                    value={selectedAddressOption}
                    onChange={handleAddressChange}
                    disabled={isViewMode}
                  />
                </div>
              </div>
              <div className='grid grid-col-1 md:grid-cols-2 gap-3 mt-3'>
                {['latitude', 'longitude'].map((name) => (
                  <div key={name}>
                    <label className='block mb-2 text-sm font-medium text-gray-900'>
                      {name.charAt(0).toUpperCase() + name.slice(1)} <span className='text-red-500'>*</span>
                    </label>
                    <TextField
                      size='small'
                      type='text'
                      name={name}
                      id={name}
                      fullWidth
                      required
                      placeholder={name.charAt(0).toUpperCase() + name.slice(1)}
                      value={formVal[name]}
                      onChange={handleChange}
                      disabled={isViewMode}
                      inputProps={{ inputMode: 'decimal', pattern: '[0-9.\\-]*' }}
                    />
                  </div>
                ))}
              </div>
              <div className='grid grid-col-1 md:grid-cols-1 gap-3 mt-3'>
                <div>
                  <label className='block mb-2 text-sm font-medium text-gray-900'>
                    Map <span className='text-red-500'>*</span>
                  </label>
                  <div className='map w-full h-96 bg-gray-500 rounded-2xl'>
                    <MapContainer
                      center={[
                        hasValidLatLng ? parseFloat(formVal.latitude) : 20.5937,
                        hasValidLatLng ? parseFloat(formVal.longitude) : 78.9629,
                      ]}
                      zoom={hasValidLatLng ? 15 : 5}
                      className='w-full h-full'>
                      <TileLayer
                        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                        attribution='&copy; OpenStreetMap contributors'
                      />
                      <MapClickHandler onMapClick={handleMapClick} disabled={isViewMode} />
                      {hasValidLatLng && (
                        <Marker
                          key={formVal.latitude + '-' + formVal.longitude}
                          position={[
                            parseFloat(formatLatLng(formVal.latitude)),
                            parseFloat(formatLatLng(formVal.longitude)),
                          ]}
                          icon={customIcon}>
                          <Popup>
                            <div>
                              <strong>{formVal.address}</strong>
                            </div>
                          </Popup>
                        </Marker>
                      )}
                    </MapContainer>
                  </div>
                  {!isViewMode && (
                    <p className='text-xs text-gray-500 mt-1'>Click on the map to set latitude and longitude.</p>
                  )}
                </div>
              </div>
              <div className='flex justify-end gap-4 mt-4'>
                {!isViewMode && (
                  <button
                    type='submit'
                    className='text-white bg-[#07163d] hover:bg-[#07163d]/90 focus:ring-4 focus:outline-none focus:ring-[#07163d]/30 font-medium rounded-md text-sm px-5 py-2.5 text-center cursor-pointer'>
                    Save
                  </button>
                )}
                <Link to='/master/employee'>
                  <button
                    type='button'
                    className='text-white bg-gray-500 hover:bg-gray-500/90 focus:ring-4 focus:outline-none focus:ring-gray-500/30 font-medium rounded-md text-sm px-5 py-2.5 text-center cursor-pointer'>
                    Back
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default EmployeeForm;
