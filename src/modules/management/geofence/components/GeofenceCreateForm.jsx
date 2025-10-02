import * as Yup from 'yup';
import { Formik } from 'formik';
import ColorPicker from './ColorPicker';
import { APIURL } from '../../../../constants';
import { ApiService } from '../../../../services';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVehicles } from '../../../../redux/vehicleSlice';
import { Button, TextField, Autocomplete } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const geofenceTypeOptions = [
  { label: 'In Area', value: 'In Area' },
  { label: 'Out Area', value: 'Out Area' },
  { label: 'Area', value: 'Area' },
];

const GeofenceCreateForm = ({ selectedColor, onColorChange, handleClear, cordinates }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state } = useLocation();
  const rowData = useMemo(() => state?.rowData || {}, [state]);
  const [latFromCoord, lonFromCoord] = rowData.coordinates?.[0]?.split(',') || [];

  const [isCordinatesEmpty, setIsCordinatesEmpty] = useState(false);

  const vehicles = useSelector((s) => s.vehicle?.vehicles?.data || []);

  useEffect(() => {
    dispatch(fetchVehicles());
  }, [dispatch]);

  const initialValues = useMemo(
    () => ({
      bus: rowData.vehicleID || '',
      geofenceType: String(rowData.geofenceType || ''),
      geofenceName: rowData.geofenceName || '',
      coordinates: Array.isArray(rowData.coordinates) ? rowData.coordinates : cordinates || [],
      color: rowData.color || selectedColor,
      latitude: latFromCoord || '',
      longitude: lonFromCoord || '',
      location: rowData.location || '',
    }),
    [rowData, cordinates, selectedColor, latFromCoord, lonFromCoord]
  );

  const validationSchema = Yup.object({
    geofenceType: Yup.string().required('Geofence Type is required'),
    geofenceName: Yup.string().required('Geofence Name is required'),
    location: Yup.string().required('Location is required'),
    latitude: Yup.number().typeError('Latitude must be a number').required('Latitude is required'),
    longitude: Yup.number().typeError('Longitude must be a number').required('Longitude is required'),
  });

  const handleFormSubmit = async (values, { resetForm }) => {
    if (!cordinates?.length) {
      setIsCordinatesEmpty(true);
      return;
    }
    setIsCordinatesEmpty(false);

    const formattedCoordinates = (typeof cordinates === 'string' ? JSON.parse(cordinates) : cordinates).map(
      ([lat, lon]) => `${lat},${lon}`
    );

    const selectedVehicle = vehicles?.find((v) => v.id === values.bus);
    const companyId = selectedVehicle?.company_id;
    if (!companyId) {
      alert('Company ID not found for selected vehicle');
      return;
    }

    const payload = {
      company_id: companyId,
      vehicle_id: values.bus,
      geofence_name: values.geofenceName,
      type: values.geofenceType,
      coordinates: formattedCoordinates,
      color: values.color,
      latitude: values.latitude,
      longitude: values.longitude,
      location: values.location,
    };

    let response;
    if (rowData.geofenceID) {
      response = await ApiService.put(`${APIURL.GEOFENCE}/${rowData.geofenceID}?company_id=${companyId}`, payload);
    } else {
      response = await ApiService.post(APIURL.GEOFENCE, payload);
    }

    if (response.success) {
      alert(response.message || 'Success!');
      navigate('/management/geofence');
      resetForm();
      handleClear();
    } else {
      alert(response.message || 'Error');
    }
  };

  return (
    <Formik
      onSubmit={handleFormSubmit}
      enableReinitialize
      initialValues={initialValues}
      validationSchema={validationSchema}>
      {({ values, errors, touched, handleBlur, handleSubmit, setFieldValue }) => (
        <form onSubmit={handleSubmit}>
          <div className='mb-3'>
            <label className='block mb-2 text-sm font-medium text-gray-900'>Select Vehicle</label>
            <Autocomplete
              disablePortal
              options={vehicles.map((item) => ({ label: item.vehicle_name, value: item.id }))}
              isOptionEqualToValue={(option, value) => option.value === value}
              getOptionLabel={(option) => option.label}
              size='small'
              className='w-full'
              name='bus'
              id='bus'
              value={
                vehicles
                  .map((item) => ({ label: item.vehicle_name, value: item.id }))
                  .find((opt) => opt.value === values.bus) || null
              }
              onChange={(_, newValue) => setFieldValue('bus', newValue ? newValue.value : '')}
              onBlur={handleBlur}
              renderInput={(params) => <TextField {...params} label='Select Vehicle' />}
            />
            {errors.bus && touched.bus && <span className='text-red-500'>{errors.bus}</span>}
          </div>
          <div className='mb-3'>
            <label className='block mb-2 text-sm font-medium text-gray-900'>Select Geofence Type</label>
            <Autocomplete
              disablePortal
              options={geofenceTypeOptions}
              isOptionEqualToValue={(option, value) => option.value === value}
              getOptionLabel={(option) => option.label}
              className='w-full'
              size='small'
              name='geofenceType'
              id='geofenceType'
              value={geofenceTypeOptions.find((opt) => opt.value === values.geofenceType) || null}
              onChange={(_, newValue) => setFieldValue('geofenceType', newValue ? newValue.value : '')}
              onBlur={handleBlur}
              renderInput={(params) => <TextField {...params} label='Select Geofence Type' />}
            />
            {errors.geofenceType && touched.geofenceType && <span className='text-red-500'>{errors.geofenceType}</span>}
          </div>
          <div className='mb-3'>
            <label className='block mb-2 text-sm font-medium text-gray-900'>Geofence Name</label>
            <TextField
              placeholder='Geofence Name'
              className='w-full'
              size='small'
              name='geofenceName'
              id='geofenceName'
              value={values.geofenceName}
              onChange={(e) => setFieldValue('geofenceName', e.target.value)}
              onBlur={handleBlur}
            />
            {errors.geofenceName && touched.geofenceName && <span className='text-red-500'>{errors.geofenceName}</span>}
          </div>
          <div className='mb-3'>
            <label className='block mb-2 text-sm font-medium text-gray-900'>Latitude</label>
            <TextField
              placeholder='Latitude'
              className='w-full'
              size='small'
              name='latitude'
              id='latitude'
              value={values.latitude}
              onChange={(e) => setFieldValue('latitude', e.target.value)}
              onBlur={handleBlur}
            />
          </div>
          <div className='mb-3'>
            <label className='block mb-2 text-sm font-medium text-gray-900'>Longitude</label>
            <TextField
              placeholder='Longitude'
              className='w-full'
              size='small'
              name='longitude'
              id='longitude'
              value={values.longitude}
              onChange={(e) => setFieldValue('longitude', e.target.value)}
              onBlur={handleBlur}
            />
          </div>
          <div className='mb-3'>
            <label className='block mb-2 text-sm font-medium text-gray-900'>Location</label>
            <TextField
              placeholder='Location'
              className='w-full'
              size='small'
              name='location'
              id='location'
              value={values.location}
              onChange={(e) => setFieldValue('location', e.target.value)}
              onBlur={handleBlur}
            />
            {errors.location && touched.location && <span className='text-red-500'>{errors.location}</span>}
          </div>
          <ColorPicker selectedColor={selectedColor} onColorChange={onColorChange} handleClear={handleClear} />
          {isCordinatesEmpty && <span className='text-red-500'>Geofence coordinates cannot be empty</span>}
          <div className='flex float-end gap-3'>
            <Link to='/management/geofence'>
              <Button
                type='button'
                className='bg-gray-400 text-white focus:bg-gray-400 focus:text-white hover:bg-gray-600 hover:text-white mt-6'
                onClick={handleClear}>
                Back
              </Button>
            </Link>
            <Button
              type='submit'
              className='bg-custom-blue text-white focus:bg-custom-blue focus:text-white hover:bg-blue-800 hover:text-white mt-6'>
              Save
            </Button>
          </div>
        </form>
      )}
    </Formik>
  );
};

export default GeofenceCreateForm;
