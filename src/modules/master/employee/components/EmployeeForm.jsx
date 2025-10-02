import L from 'leaflet';
import { APIURL } from '../../../../constants';
import { useDropdownOpt } from '../../../../hooks/useDropdownOpt';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AddressServices, ApiService } from '../../../../services';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
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

function isValidLatLng(lat, lng) {
  const latNum = Number(lat);
  const lngNum = Number(lng);
  return !isNaN(latNum) && !isNaN(lngNum) && latNum >= -90 && latNum <= 90 && lngNum >= -180 && lngNum <= 180;
}

function EmployeeForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const rowData = location.state;
  const companyID = localStorage.getItem('company_id');

  const fileInputRef = useRef(null);
  const addressTimeoutRef = useRef(null);
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
    setFormVal((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFormVal((prev) => ({ ...prev, profilePhoto: e.dataTransfer.files[0] }));
      e.dataTransfer.clearData();
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  useEffect(() => {
    if (rowData && (rowData.mode === 'edit' || rowData.mode === 'view')) {
      const data = rowData.rowData;
      const [firstName = '', lastName = ''] = data.employeeName?.split(' ') || [];

      const selectedAddress = data.address
        ? {
            label: data.address,
            value: `${data.boarding_latitude}-${data.boarding_longitude}`,
            otherData: {
              display_name: data.address,
              lat: data.boarding_latitude,
              lon: data.boarding_longitude,
            },
          }
        : null;

      setFormVal({
        firstName,
        lastName,
        employeeId: data.employee_id || '',
        punchId: data.punch_id || '',
        email: data.email || '',
        phoneNumber: data.phone_number || '',
        selectedDepartment: data.departmentId || '',
        selectedPlant: data.plantId || '',
        dateOfJoining: data.doj || '',
        dateOfBirth: data.dob || '',
        selectedGender: data.gender === 'Male' ? '2' : data.gender === 'Female' ? '1' : '',
        vehicleRoute: data.vehicle_route_id || '',
        boardingPoint: data.boarding_address || '',
        profilePhoto: null,
        address: data.address || '',
        latitude: data.boarding_latitude || '',
        longitude: data.boarding_longitude || '',
      });

      setSelectedAddressOption(selectedAddress);
    }
  }, [rowData]);

  const handleFormSubmit = useCallback(
    async (event) => {
      event.preventDefault();

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
        latitude: parseFloat(formVal.latitude) || '',
        longitude: parseFloat(formVal.longitude) || '',
        address: formVal.address,
        boarding_latitude: parseFloat(formVal.latitude) || '',
        boarding_longitude: parseFloat(formVal.longitude) || '',
        status_id: 1,
      };

      let res;
      if (rowData) {
        res = await ApiService.put(`${APIURL.EMPLOYEE}/${rowData.rowData.actual_id}?company_id=${companyID}`, payload);
      } else {
        res = await ApiService.post(APIURL.EMPLOYEE, payload);
      }

      if (res?.success) {
        navigate('/master/employee');
      } else {
        alert(res?.message || 'Something went wrong.');
        console.error(res?.message);
      }
    },
    [formVal, rowData, companyID, navigate]
  );

  const departmentValue = useMemo(
    () => departmentDropdown.options.find((opt) => opt.value === formVal.selectedDepartment) || null,
    [departmentDropdown.options, formVal.selectedDepartment]
  );
  const plantValue = useMemo(
    () => plantDropdown.options.find((opt) => opt.value === formVal.selectedPlant) || null,
    [plantDropdown.options, formVal.selectedPlant]
  );
  const routeValue = useMemo(
    () => routeDropdown.options.find((opt) => opt.value === formVal.vehicleRoute) || null,
    [routeDropdown.options, formVal.vehicleRoute]
  );
  const boardingValue = useMemo(
    () => bordingDropdown.options.find((opt) => opt.value === formVal.boardingPoint) || null,
    [bordingDropdown.options, formVal.boardingPoint]
  );

  const handleAddressInputChange = useCallback((event, value) => {
    if (addressTimeoutRef.current) clearTimeout(addressTimeoutRef.current);
    addressTimeoutRef.current = setTimeout(async () => {
      if (value.length > 0) setAddressOnSearch((await AddressServices.getLocationFromName(value)) || []);
    }, 500);
  }, []);

  const handleAddressChange = useCallback((event, newValue) => {
    setSelectedAddressOption(newValue);
    if (newValue) {
      setFormVal((prev) => ({
        ...prev,
        address: newValue.otherData.display_name,
        latitude: newValue.otherData.lat,
        longitude: newValue.otherData.lon,
      }));
    } else {
      setFormVal((prev) => ({ ...prev, address: '', latitude: '', longitude: '' }));
    }
  }, []);

  const profileImageSrc = useMemo(() => {
    if (!formVal.profilePhoto) return null;
    if (typeof formVal.profilePhoto === 'string') return formVal.profilePhoto;
    return URL.createObjectURL(formVal.profilePhoto);
  }, [formVal.profilePhoto]);

  const addressOptions = Array.isArray(addressOnSearch)
    ? addressOnSearch.map((item) => ({ label: item.display_name, value: item.place_id, otherData: item }))
    : [];

  // --- Begin: Map marker validation logic ---
  const lat = formVal.latitude;
  const lng = formVal.longitude;
  const hasValidLatLng = isValidLatLng(lat, lng);
  // --- End: Map marker validation logic ---

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
                <div>
                  <label className='block mb-2 text-sm font-medium text-gray-900'>
                    Employee First Name <span className='text-red-500'>*</span>
                  </label>
                  <TextField
                    size='small'
                    type='text'
                    name='firstName'
                    id='firstName'
                    fullWidth
                    required
                    placeholder='Employee First Name'
                    value={formVal.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className='block mb-2 text-sm font-medium text-gray-900'>
                    Employee Last Name <span className='text-red-500'>*</span>
                  </label>
                  <TextField
                    size='small'
                    type='text'
                    name='lastName'
                    id='lastName'
                    fullWidth
                    required
                    placeholder='Employee Last Name'
                    value={formVal.lastName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className='block mb-2 text-sm font-medium text-gray-900'>
                    Employee Id <span className='text-red-500'>*</span>
                  </label>
                  <TextField
                    size='small'
                    type='text'
                    name='employeeId'
                    id='employeeId'
                    fullWidth
                    required
                    placeholder='Employee Id'
                    value={formVal.employeeId}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className='block mb-2 text-sm font-medium text-gray-900'>
                    Punch Id <span className='text-red-500'>*</span>
                  </label>
                  <TextField
                    size='small'
                    type='text'
                    name='punchId'
                    id='punchId'
                    fullWidth
                    required
                    placeholder='Punch Id'
                    value={formVal.punchId}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className='block mb-2 text-sm font-medium text-gray-900'>
                    Email <span className='text-red-500'>*</span>
                  </label>
                  <TextField
                    size='small'
                    type='email'
                    name='email'
                    id='email'
                    fullWidth
                    required
                    placeholder='Email'
                    value={formVal.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className='block mb-2 text-sm font-medium text-gray-900'>
                    Phone Number <span className='text-red-500'>*</span>
                  </label>
                  <TextField
                    size='small'
                    type='number'
                    name='phoneNumber'
                    id='phoneNumber'
                    fullWidth
                    required
                    placeholder='Phone Number'
                    value={formVal.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className='block mb-2 text-sm font-medium text-gray-900'>
                    Select Department <span className='text-red-500'>*</span>
                  </label>
                  <Autocomplete
                    disablePortal
                    options={departmentDropdown.options}
                    loading={departmentDropdown.loading}
                    value={departmentValue}
                    onChange={(_, newValue) =>
                      setFormVal((prev) => ({ ...prev, selectedDepartment: newValue ? newValue.value : '' }))
                    }
                    isOptionEqualToValue={(option, value) => option?.value === value?.value}
                    getOptionLabel={(option) => option?.label || ''}
                    renderInput={(params) => (
                      <TextField {...params} label='Select Department' size='small' fullWidth required />
                    )}
                  />
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
                </div>
                <div>
                  <label className='block mb-2 text-sm font-medium text-gray-900'>
                    Select Plant <span className='text-red-500'>*</span>
                  </label>
                  <Autocomplete
                    disablePortal
                    options={plantDropdown.options}
                    loading={plantDropdown.loading}
                    value={plantValue}
                    onChange={(_, newValue) =>
                      setFormVal((prev) => ({ ...prev, selectedPlant: newValue ? newValue.value : '' }))
                    }
                    isOptionEqualToValue={(option, value) => option?.value === value?.value}
                    getOptionLabel={(option) => option?.label || ''}
                    renderInput={(params) => (
                      <TextField {...params} label='Select Plant' size='small' fullWidth required />
                    )}
                  />
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
                </div>
                <div>
                  <label className='block mb-2 text-sm font-medium text-gray-900'>
                    Joining Date <span className='text-red-500'>*</span>
                  </label>
                  <TextField
                    size='small'
                    type='date'
                    name='dateOfJoining'
                    id='dateOfJoining'
                    fullWidth
                    required
                    placeholder='Joining Date'
                    value={formVal.dateOfJoining}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className='block mb-2 text-sm font-medium text-gray-900'>
                    Date Of Birth <span className='text-red-500'>*</span>
                  </label>
                  <TextField
                    size='small'
                    type='date'
                    name='dateOfBirth'
                    id='dateOfBirth'
                    fullWidth
                    required
                    placeholder='Date Of Birth'
                    value={formVal.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className='block mb-2 text-sm font-medium text-gray-900'>Vehicle Route</label>
                  <Autocomplete
                    disablePortal
                    loading={routeDropdown.loading}
                    options={routeDropdown.options}
                    value={routeValue}
                    onChange={(_, newValue) =>
                      setFormVal((prev) => ({ ...prev, vehicleRoute: newValue ? newValue.value : '' }))
                    }
                    isOptionEqualToValue={(option, value) => option?.value === value?.value}
                    getOptionLabel={(option) => option?.label || ''}
                    renderInput={(params) => <TextField {...params} label='Select Route' size='small' fullWidth />}
                  />
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
                </div>
                <div>
                  <label className='block mb-2 text-sm font-medium text-gray-900'>Boarding Point</label>
                  <Autocomplete
                    disablePortal
                    loading={bordingDropdown.loading}
                    options={bordingDropdown.options}
                    value={boardingValue}
                    onChange={(_, newValue) =>
                      setFormVal((prev) => ({
                        ...prev,
                        boardingPoint: newValue ? newValue.value : '',
                      }))
                    }
                    isOptionEqualToValue={(option, value) => option?.value === value?.value}
                    getOptionLabel={(option) => option?.label || ''}
                    renderInput={(params) => (
                      <TextField {...params} label='Select Boarding Points' size='small' fullWidth />
                    )}
                  />
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
                </div>
                <div>
                  <FormControl>
                    <FormLabel id='gender-radio'>
                      Gender <span className='text-red-500'>*</span>
                    </FormLabel>
                    <RadioGroup
                      aria-labelledby='gender-radio'
                      value={formVal.selectedGender}
                      name='selectedGender'
                      onChange={handleChange}>
                      <FormControlLabel value='1' control={<Radio />} label='Female' />
                      <FormControlLabel value='2' control={<Radio />} label='Male' />
                    </RadioGroup>
                  </FormControl>
                </div>
                <div>
                  <label className='block mb-2 text-sm font-medium text-gray-900'>Profile Image</label>
                  <div className='flex items-center justify-center w-full'>
                    <div
                      className='flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100'
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}>
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
                    isOptionEqualToValue={(option, value) => option?.value === value?.value}
                    getOptionLabel={(option) => option.label}
                    size='small'
                    renderInput={(params) => <TextField {...params} placeholder='Address' />}
                    onInputChange={handleAddressInputChange}
                    value={selectedAddressOption}
                    onChange={handleAddressChange}
                  />
                </div>
              </div>
              <div className='grid grid-col-1 md:grid-cols-2 gap-3 mt-3'>
                <div>
                  <label className='block mb-2 text-sm font-medium text-gray-900'>
                    Latitude <span className='text-red-500'>*</span>
                  </label>
                  <TextField
                    size='small'
                    type='text'
                    name='latitude'
                    id='latitude'
                    fullWidth
                    required
                    placeholder='Latitude'
                    value={formVal.latitude}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className='block mb-2 text-sm font-medium text-gray-900'>
                    Longitude <span className='text-red-500'>*</span>
                  </label>
                  <TextField
                    size='small'
                    type='text'
                    name='longitude'
                    id='longitude'
                    fullWidth
                    required
                    placeholder='Longitude'
                    value={formVal.longitude}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className='grid grid-col-1 md:grid-cols-1 gap-3 mt-3'>
                <div>
                  <label className='block mb-2 text-sm font-medium text-gray-900'>
                    Map <span className='text-red-500'>*</span>
                  </label>
                  <div className='map w-full h-96 bg-gray-500 rounded-2xl'>
                    <MapContainer center={[20.5937, 78.9629]} zoom={5} className='w-full h-full'>
                      <TileLayer
                        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                        attribution='&copy; OpenStreetMap contributors'
                      />
                      {hasValidLatLng && (
                        <Marker
                          key={formVal.latitude}
                          position={[parseFloat(formVal.latitude), parseFloat(formVal.longitude)]}
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
                </div>
              </div>
              <div className='flex justify-end gap-4 mt-4'>
                <button
                  type='submit'
                  className='text-white bg-[#07163d] hover:bg-[#07163d]/90 focus:ring-4 focus:outline-none focus:ring-[#07163d]/30 font-medium rounded-md text-sm px-5 py-2.5 text-center cursor-pointer'>
                  Save
                </button>
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
