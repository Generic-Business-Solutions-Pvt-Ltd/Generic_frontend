import { useEffect, useState } from 'react';
import { APIURL } from '../../../../constants';
import { ApiService } from '../../../../services';
import { Link, useNavigate } from 'react-router-dom';
import { Autocomplete, TextField } from '@mui/material';
import { useAuth } from '../../../../context/AuthContext';

function AnnouncementForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mssg, setMssg] = useState('');
  const [title, setTitle] = useState('');
  const [empData, setEmpData] = useState([]);
  const [selectedValue, setSelectedValue] = useState([]);

  useEffect(() => {
    ApiService.get(APIURL.EMPLOYEE)
      .then((res) =>
        res.success ? setEmpData(res.data.employes) : alert(res.message || 'Failed to fetch employee data')
      )
      .catch((err) => alert('Something went wrong while fetching employee data', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title,
      sender_id: user,
      message: mssg,
      employee_ids: selectedValue.map((item) => item.value),
    };
    const res = await ApiService.post(APIURL.ANNOUNCEMENT, payload);
    if (res.success) navigate('/management/announcements');
    else alert(res.message || 'Something went wrong.');
  };

  return (
    <div className='bg-white rounded-sm border-t-3 border-b-3 border-[#07163d]'>
      <h1 className='text-2xl font-bold p-3 text-[#07163d]'>Send Announcement</h1>
      <p className='mx-3 mb-2'>
        <span className='text-red-500'>*</span> indicates required field
      </p>
      <hr className='border border-gray-300' />
      <div className='p-5'>
        <form onSubmit={handleSubmit}>
          <div className='grid lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 gap-4'>
            <div>
              <label className='block mb-2 text-sm font-medium text-gray-900'>
                Select User <span className='text-red-500'>*</span>
              </label>
              <Autocomplete
                multiple
                disablePortal
                options={empData.map((item) => ({
                  label: `${item.first_name} ${item.last_name}`,
                  value: item.id,
                }))}
                isOptionEqualToValue={(option, value) => option.value === value}
                getOptionLabel={(option) => option.label}
                size='small'
                renderInput={(params) => <TextField {...params} label='Select User' />}
                onChange={(_, val) => setSelectedValue(val)}
              />
            </div>
            <div>
              <label className='block mb-2 text-sm font-medium text-gray-900'>
                Announcement Title <span className='text-red-500'>*</span>
              </label>
              <TextField
                type='text'
                id='title'
                name='title'
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                size='small'
                placeholder='Enter Title'
                required
              />
            </div>
            <div>
              <label className='block mb-2 text-sm font-medium text-gray-900'>
                Announcement Message <span className='text-red-500'>*</span>
              </label>
              <textarea
                id='message'
                rows='4'
                className='block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                placeholder='Write your messages here...'
                value={mssg}
                onChange={(e) => setMssg(e.target.value)}
              />
            </div>
            <div className='flex justify-end gap-4 mt-4 items-center'>
              <button
                type='submit'
                className='text-white bg-[#07163d] hover:bg-[#07163d]/90 focus:ring-4 focus:outline-none focus:ring-[#07163d]/30 font-medium rounded-md text-sm px-5 py-2.5 text-center cursor-pointer'>
                Save
              </button>
              <Link to='/management/announcements'>
                <button
                  type='button'
                  className='text-white bg-gray-500 hover:bg-gray-500/90 focus:ring-4 focus:outline-none focus:ring-gray-500/30 font-medium rounded-md text-sm px-5 py-2.5 text-center cursor-pointer'>
                  Back
                </button>
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AnnouncementForm;
