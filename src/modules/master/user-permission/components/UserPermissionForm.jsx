import { Autocomplete, TextField } from '@mui/material';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const departments = [
  { label: 'The Shawshank Redemption', value: '1994' },
  { label: 'Department', value: '1994' },
];

const plants = [
  { label: 'The Shawshank Redemption', value: '1994' },
  { label: 'Department', value: '1994' },
];

function UserPermissionForm() {
  const location = useLocation();
  const rowData = location.state;
  console.log(rowData);

  const [formValues, setFormValues] = useState({
    employeeId: '',
    name: '',
    department: '',
    plant: '',
    password: '',
    email: '',
  });

  const handleFormSubmit = (event) => {
    event.preventDefault();
    if (rowData) {
      // Edit logic here
      console.log('edit', formValues, rowData);
    } else {
      // Create logic here
      console.log('create', formValues);
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
        <h1 className='text-2xl font-bold p-3 text-[#07163d]'>Operator Details</h1>
        <p className='mx-3 mb-2'>
          <span className='text-red-500'>*</span> indicates required field
        </p>
        <hr className='border border-gray-300' />
        <div className='p-5'>
          <form onSubmit={handleFormSubmit}>
            <div className='grid lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1  gap-4'>
              <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>
                  Employee ID <span className='text-red-500'>*</span>
                </label>
                <TextField
                  type='text'
                  id='employeeId'
                  name='employeeId'
                  size='small'
                  fullWidth
                  placeholder='Enter Employee ID'
                  required
                  value={formValues.employeeId}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>
                  Name <span className='text-red-500'>*</span>
                </label>
                <TextField
                  type='text'
                  id='name'
                  name='name'
                  fullWidth
                  size='small'
                  placeholder='Enter Name'
                  required
                  value={formValues.name}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>
                  Select Department <span className='text-red-500'>*</span>
                </label>
                <Autocomplete
                  disablePortal
                  options={departments}
                  isOptionEqualToValue={(option, value) => option.value === value}
                  getOptionLabel={(option) => option.label}
                  size='small'
                  onChange={(event, newValue) => {
                    setFormValues({
                      ...formValues,
                      department: newValue ? newValue.value : '',
                    });
                  }}
                  value={departments.find((opt) => opt.value === formValues.department) || null}
                  renderInput={(params) => <TextField {...params} label='Select Department' />}
                />
              </div>

              <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>
                  Select Plant <span className='text-red-500'>*</span>
                </label>
                <Autocomplete
                  disablePortal
                  options={plants}
                  isOptionEqualToValue={(option, value) => option.value === value}
                  getOptionLabel={(option) => option.label}
                  size='small'
                  onChange={(event, newValue) => {
                    setFormValues({
                      ...formValues,
                      plant: newValue ? newValue.value : '',
                    });
                  }}
                  value={plants.find((opt) => opt.value === formValues.plant) || null}
                  renderInput={(params) => <TextField {...params} label='Select Plant' />}
                />
              </div>

              <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>
                  Password <span className='text-red-500'>*</span>
                </label>
                <TextField
                  size='small'
                  type='password'
                  name='password'
                  id='password'
                  fullWidth
                  placeholder='Enter Password'
                  required
                  value={formValues.password}
                  onChange={handleInputChange}
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
                  placeholder='Enter Email'
                  required
                  value={formValues.email}
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
              <Link to='/master/user-permission'>
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

export default UserPermissionForm;
