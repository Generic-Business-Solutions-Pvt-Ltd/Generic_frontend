import { useEffect, useState } from 'react';
import { APIURL } from '../../../../constants';
import { ApiService } from '../../../../services';
import { Autocomplete, TextField } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDropdownOpt } from '../../../../hooks/useDropdownOpt';

function PlantInTimeForm() {
  const location = useLocation();
  const rowData = location.state;

  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    bus: '',
    busRoute: '',
    dayGenStartTime: '',
    dayGenEndTime: '',
    nightGenStartTime: '',
    nightGenEndTime: '',
    firstShiftStartTime: '',
    firstShiftEndTime: '',
    secondShiftStartTime: '',
    secondShiftEndTime: '',
    thirdShiftStartTime: '',
    thirdShiftEndTime: '',
  });

  const [plantData, setPlantData] = useState([]);

  const companyId = localStorage.getItem('company_id');

  const {
    options: buses,
    loading: busesLoading,
    error: busesError,
    refetch: busesRefetch,
  } = useDropdownOpt({
    apiUrl: APIURL.VEHICLE,
    queryParams: { company_id: companyId },
    labelSelector: (d) => `${d.vehicle_name}`,
    valueSelector: (d) => d.id,
  });

  const {
    options: busRoutes,
    loading: routeLoading,
    error: routeError,
    refetch: routeRefetch,
  } = useDropdownOpt({
    apiUrl: APIURL.VEHICLE_ROUTE,
    queryParams: { company_id: companyId },
    labelSelector: (d) => `${d.name}`,
    valueSelector: (d) => d.id,
  });

  const getvehicleData = async () => {
    try {
      const res = await ApiService.get(APIURL.PLANTINTIME, { company_id: companyId });

      if (res.success) {
        setPlantData(res.data);
      } else {
        console.error('Failed to fetch employee data:', res.message || 'Unknown error');

        alert(res.message || 'Failed to fetch employee data');
      }
    } catch (error) {
      console.error('API call failed:', error.message || error);
      alert('Something went wrong while fetching Plant in Time data');
    }
  };

  useEffect(() => {
    getvehicleData();

    if (rowData) {
      setFormValues({
        bus: rowData.vehicle_id,
        busRoute: rowData.route_id,
        dayGenStartTime: rowData.dayGeneral,
        dayGenEndTime: '',
        nightGenStartTime: rowData.nightGeneral,
        nightGenEndTime: '',
        firstShiftStartTime: rowData.firstGeneral,
        firstShiftEndTime: '',
        secondShiftStartTime: rowData.secondGeneral,
        secondShiftEndTime: '',
        thirdShiftStartTime: rowData.thirdGeneral,
        thirdShiftEndTime: '',
      });
    }
  }, []);

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      vehicle_id: formValues.bus,
      company_id: companyId,
      vehicle_route_id: formValues.busRoute,
      day_general_start_time: formValues.dayGenStartTime,
      day_general_end_time: formValues.dayGenEndTime,
      night_general_start_time: formValues.nightGenStartTime,
      night_general_end_time: formValues.nightGenEndTime,
      first_shift_start_time: formValues.firstShiftStartTime,
      first_shift_end_time: formValues.firstShiftEndTime,
      second_shift_start_time: formValues.secondShiftStartTime,
      second_shift_end_time: formValues.secondShiftEndTime,
      third_shift_start_time: formValues.thirdShiftStartTime,
      third_shift_end_time: formValues.thirdShiftEndTime,
    };
    if (rowData) {
      // Edit logic here
      console.log('edit', formValues, rowData, payload);

      const res = await ApiService.put(`${APIURL.PLANTINTIME}/${rowData.plantId}`, payload);

      if (res.success) {
        console.log('🚀 ~ PlantInTimeForm.jsx:99 ~ handleFormSubmit ~ res:', res);
        navigate('/master/plant-in-time');
      } else {
        alert(res.message || 'Something went wrong.');
        console.error(response.message);
      }
    } else {
      // Create logic here
      console.log('create', formValues);

      const res = await ApiService.post(APIURL.PLANTINTIME, payload);

      if (res.success) {
        console.log('🚀 ~ PlantInTimeForm.jsx:99 ~ handleFormSubmit ~ res:', res);
        navigate('/master/plant-in-time');
      } else {
        alert(res.message || 'Something went wrong.');
        console.error(response.message);
      }
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  return (
    <>
      <div className='bg-white rounded-sm border-t-3 border-b-3 border-[#07163d]'>
        <h1 className='text-2xl font-bold p-3 text-[#07163d]'>Create Factory In-Time Target</h1>
        <p className='mx-3 mb-2'>
          <span className='text-red-500'>*</span> indicates required field
        </p>
        <hr className='border border-gray-300' />
        <div className='p-5'>
          <form onSubmit={handleFormSubmit}>
            <div className='grid lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1  gap-4'>
              <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>
                  Select Vehicle <span className='text-red-500'>*</span>
                </label>
                <Autocomplete
                  disablePortal
                  loading={busesLoading}
                  options={buses}
                  isOptionEqualToValue={(option, value) => option.value === value}
                  getOptionLabel={(option) => option.label}
                  size='small'
                  onChange={(event, newValue) => {
                    setFormValues({
                      ...formValues,
                      bus: newValue ? newValue.value : '',
                    });
                  }}
                  value={buses.find((opt) => opt.value === formValues.department) || null}
                  renderInput={(params) => <TextField {...params} label='Select Vehicle' />}
                />

                {busesError && (
                  <p className='text-red-500 text-sm mt-1'>
                    Failed to load Vehicle Name.{' '}
                    <button
                      onClick={busesRefetch}
                      className='text-blue-600 underline hover:text-blue-800 transition-colors duration-200'>
                      Retry
                    </button>
                  </p>
                )}
              </div>

              <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>
                  Select Vehicle Route <span className='text-red-500'>*</span>
                </label>
                <Autocomplete
                  disablePortal
                  loading={routeLoading}
                  options={busRoutes}
                  isOptionEqualToValue={(option, value) => option.value === value}
                  getOptionLabel={(option) => option.label}
                  size='small'
                  onChange={(event, newValue) => {
                    setFormValues({
                      ...formValues,
                      busRoute: newValue ? newValue.value : '',
                    });
                  }}
                  value={busRoutes.find((opt) => opt.value === formValues.busRoute) || null}
                  renderInput={(params) => <TextField {...params} label='Select Vehicle Route' />}
                />

                {routeError && (
                  <p className='text-red-500 text-sm mt-1'>
                    Failed to load Routes.{' '}
                    <button
                      onClick={routeRefetch}
                      className='text-blue-600 underline hover:text-blue-800 transition-colors duration-200'>
                      Retry
                    </button>
                  </p>
                )}
              </div>
              <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>
                  Day General Start time <span className='text-red-500'>*</span>
                </label>
                <TextField
                  size='small'
                  type='time'
                  name='dayGenStartTime'
                  id='dayGenStartTime'
                  fullWidth
                  required
                  value={formValues.dayGenStartTime}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>
                  Day General End Time <span className='text-red-500'>*</span>
                </label>
                <TextField
                  size='small'
                  type='time'
                  name='dayGenEndTime'
                  id='dayGenEndTime'
                  fullWidth
                  required
                  value={formValues.dayGenEndTime}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>
                  Night General Start time <span className='text-red-500'>*</span>
                </label>
                <TextField
                  size='small'
                  type='time'
                  name='nightGenStartTime'
                  id='nightGenStartTime'
                  fullWidth
                  required
                  value={formValues.nightGenStartTime}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>
                  Night General End Time <span className='text-red-500'>*</span>
                </label>
                <TextField
                  size='small'
                  type='time'
                  name='nightGenEndTime'
                  id='nightGenEndTime'
                  fullWidth
                  required
                  value={formValues.nightGenEndTime}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>
                  First Shift Start time <span className='text-red-500'>*</span>
                </label>
                <TextField
                  size='small'
                  type='time'
                  name='firstShiftStartTime'
                  id='firstShiftStartTime'
                  fullWidth
                  required
                  value={formValues.firstShiftStartTime}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>
                  First Shift End Time <span className='text-red-500'>*</span>
                </label>
                <TextField
                  size='small'
                  type='time'
                  name='firstShiftEndTime'
                  id='firstShiftEndTime'
                  fullWidth
                  required
                  value={formValues.firstShiftEndTime}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>
                  Second Shift Start time <span className='text-red-500'>*</span>
                </label>
                <TextField
                  size='small'
                  type='time'
                  name='secondShiftStartTime'
                  id='secondShiftStartTime'
                  fullWidth
                  required
                  value={formValues.secondShiftStartTime}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>
                  Second Shift End Time <span className='text-red-500'>*</span>
                </label>
                <TextField
                  size='small'
                  type='time'
                  name='secondShiftEndTime'
                  id='secondShiftEndTime'
                  fullWidth
                  required
                  value={formValues.secondShiftEndTime}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>
                  Third Shift Start time <span className='text-red-500'>*</span>
                </label>
                <TextField
                  size='small'
                  type='time'
                  name='thirdShiftStartTime'
                  id='thirdShiftStartTime'
                  fullWidth
                  required
                  value={formValues.thirdShiftStartTime}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>
                  Third Shift End Time <span className='text-red-500'>*</span>
                </label>
                <TextField
                  size='small'
                  type='time'
                  name='thirdShiftEndTime'
                  id='thirdShiftEndTime'
                  fullWidth
                  required
                  value={formValues.thirdShiftEndTime}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className='flex justify-end gap-4 mt-4'>
              <button
                type='submit'
                className='text-white bg-[#07163d] hover:bg-[#07163d]/90 focus:ring-4 focus:outline-none focus:ring-[#07163d]/30 font-medium rounded-md text-sm px-5 py-2.5 text-center cursor-pointer'>
                Save
              </button>
              <Link to='/master/plant-in-time'>
                <button
                  type='button'
                  className='text-white bg-gray-500 hover:bg-gray-500/90 focus:ring-4 focus:outline-none focus:ring-gray-500/30 font-medium rounded-md text-sm px-5 py-2.5 text-center cursor-pointer'>
                  Back
                </button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default PlantInTimeForm;
