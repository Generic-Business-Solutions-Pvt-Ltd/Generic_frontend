import moment from 'moment-timezone';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ArrowRightIcon from '@mui/icons-material/ArrowForwardIos';

const statusColorMap = {
  Running: '#008000',
  Idle: '#FFC107',
  Parked: '#FF0000',
  Offline: '#000DFF',
  New: '#808080',
  Unknown: '#000000',
};

const renderValue = (val) => {
  if (!val && val !== 0) return '-';
  if (Array.isArray(val)) return val.length ? val.join(', ') : '-';
  if (typeof val === 'object') {
    if (val.first_name && val.last_name) return `${val.first_name} ${val.last_name}`;
    if (val.name) return val.name;
    try {
      let str = JSON.stringify(val);
      return str.length > 60 ? str.slice(0, 57) + '...' : str;
    } catch {
      return '-';
    }
  }
  return val;
};

const Btn = ({ children }) => (
  <button className='bg-gradient-to-r from-[#1d31a6] to-[#3b5998] px-3 py-2 text-white rounded-lg text-xs font-semibold shadow hover:from-[#3b5998] hover:to-[#1d31a6] transition-all duration-150 cursor-pointer'>
    {children}
  </button>
);

const MheStatusPanel = ({ handleRightPanel, isShowPanel, vehicle }) => {
  const [dt, setDt] = useState('');

  useEffect(() => {
    setDt(moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm'));
  }, []);

  const status = vehicle?.status ?? 'Unknown';
  const fields = [
    ['Vehicle Name', 'vehicle_name'],
    ['Vehicle Number', 'vehicle_number'],
    ['Route Name', 'route_name'],
    ['Total Distance', 'total_distance'],
    ['Today Distance', 'today_distance'],
    ['Total Seats', 'seats'],
    ['Assigned Seats', 'assigned_'],
    ['Onboarded Employee', 'onboarded_employee'],
    ['Speed', 'speed'],
    ['Driver Name', 'driver_name'],
    ['Driver Number', 'driver_number'],
  ];

  return (
    <>
      {isShowPanel && (
        <div className='fixed top-2/5 z-[100000] -translate-y-1/2 transition-all duration-300 left-[calc(100vw-360px)]'>
          <button
            className='h-10 w-10 bg-gradient-to-br from-[#1d31a6] to-[#3b5998] cursor-pointer text-white flex items-center justify-center rounded-full shadow-lg border border-white'
            onClick={handleRightPanel}
            title='Hide Panel'
            type='button'>
            <ArrowRightIcon fontSize='small' />
          </button>
        </div>
      )}
      <div
        className={`fixed transition-all top-0 ${
          isShowPanel ? 'right-0' : 'right-[-340px]'
        } w-[340px] rounded-xl bg-white z-[99999] shadow-2xl border border-gray-200 flex flex-col overflow-hidden`}
        style={{ transition: 'right 0.3s', minHeight: 0, maxHeight: 'calc(100vh - 5rem)' }}>
        <div className='flex flex-col items-center bg-gradient-to-r from-[#1d31a6] to-[#3b5998] py-4 px-4 border-b border-gray-200'>
          <p className='font-bold text-lg text-white mb-1 truncate w-full text-center'>
            {renderValue(vehicle?.vehicle_name)}
          </p>
          <div className='flex justify-between items-center w-full gap-2 mt-1'>
            <span
              className='px-3 py-1 rounded-full text-xs font-semibold shadow text-center tracking-wider min-w-[60px] text-white'
              style={{ backgroundColor: statusColorMap[status] || '#000' }}>
              {status}
            </span>
            <span className='bg-white text-[#1d31a6] px-3 py-1 rounded-full text-xs font-semibold shadow border border-[#1d31a6]'>
              {dt}
            </span>
          </div>
        </div>
        <div className='flex-1 py-4 px-4 bg-gray-50 overflow-y-auto'>
          <div className='grid gap-3'>
            {fields.map(([label, key]) => (
              <div
                key={label}
                className='flex justify-between items-center bg-white rounded-md px-3 py-2 shadow-sm border border-gray-100'>
                <span className='text-gray-500 font-medium text-xs'>{label}</span>
                <span className='text-gray-900 font-semibold text-xs'>
                  {renderValue(typeof key === 'function' ? key(vehicle) : vehicle?.[key])}
                </span>
              </div>
            ))}
          </div>
          <div className='flex flex-wrap justify-center gap-3 mt-4 w-full'>
            <Link to={`/report/${status || ''}`}>
              <Btn>Reports</Btn>
            </Link>
            <Link to={`/management/vehicle-route`}>
              <Btn>Route Detail</Btn>
            </Link>
            <Link to='/playback' state={{ selectedVehicle: vehicle }}>
              <Btn>Playback</Btn>
            </Link>
            <Link to='/bus-multi-track/punch' state={{ selectedVehicle: vehicle }}>
              <Btn>Employee Punch Report</Btn>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default MheStatusPanel;
