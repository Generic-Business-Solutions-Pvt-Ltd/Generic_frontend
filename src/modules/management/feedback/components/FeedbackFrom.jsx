import { useState } from 'react';
import { TextField } from '@mui/material';
import { APIURL } from '../../../../constants';
import { ApiService } from '../../../../services';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const FeedbackFrom = () => {
  const navigate = useNavigate();
  const { state: data } = useLocation();
  const [action, setAction] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await ApiService.put(`${APIURL.FEEDBACK}/${data.id}`, { action });
    if (res?.success) {
      alert(res.message);
      navigate('/management/feedbacks');
    }
  };

  return (
    <div className='bg-white rounded-sm border-t-3 border-b-3 border-[#07163d]'>
      <h1 className='text-2xl font-bold p-3 text-[#060607]'>Feedback Details</h1>
      <p className='mx-3 mb-2'>
        <span className='text-red-500'>*</span> indicates required field
      </p>
      <hr className='border border-gray-300' />
      <div className='p-5'>
        <form onSubmit={handleSubmit}>
          <div className='grid lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 gap-4'>
            <div className='space-y-3'>
              <p>
                <span className='font-semibold'>Employee Name</span>:{' '}
                {`${data.employee.first_name || ''} ${data.employee.last_name || ''}`.trim()}
              </p>
              <p>
                <span className='font-semibold'>Rating</span>: {typeof data?.rating !== 'undefined' ? data.rating : '-'}
              </p>
              <p>
                <span className='font-semibold'>Message</span>: {data?.message || '-'}
              </p>
              <p>
                <span className='font-semibold'>Created At</span>:{' '}
                {data?.created_at ? new Date(data.created_at).toLocaleString() : '-'}
              </p>
            </div>
            <div>
              <label className='block mb-2 text-sm font-medium text-gray-900'>
                Note (Action) <span className='text-red-500'>*</span>
              </label>
              <TextField
                type='text'
                id='action'
                name='action'
                fullWidth
                size='small'
                multiline
                minRows={4}
                placeholder='Enter Action'
                value={action}
                onChange={(e) => setAction(e.target.value)}
                required
              />
            </div>
            <div className='flex justify-end gap-4 mt-4 items-center col-span-full'>
              <button
                type='submit'
                className='text-white bg-[#07163d] hover:bg-[#07163d]/90 focus:ring-4 focus:outline-none focus:ring-[#07163d]/30 font-medium rounded-md text-sm px-5 py-2.5 text-center cursor-pointer'>
                Save
              </button>
              <Link to='/management/feedbacks'>
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
};

export default FeedbackFrom;
