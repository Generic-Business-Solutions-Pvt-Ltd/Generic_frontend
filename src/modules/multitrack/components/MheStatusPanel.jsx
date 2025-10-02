import moment from 'moment-timezone';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ArrowRightIcon from '@mui/icons-material/ArrowForwardIos';
import { useSelector } from 'react-redux';

const statusColorMap = {
  Running: '#008000',
  Idle: '#FFC107',
  Parked: '#FF0000',
  Offline: '#000DFF',
  New: '#808080',
  Unknown: '#000000',
};

const getStatus = (v) => {
  if (!v) return 'Unknown';
  if (typeof v.speed === 'number') {
    if (v.speed > 0) return 'Running';
    if (v.speed === 0) return 'Parked';
  }
  if (!v.timestamp) return 'Offline';
  return 'Idle';
};

const getOdo = (v) => {
  const el = v?.ioElements?.find((e) => e.propertyName === 'totalOdometer');
  return el && Number(el.value) ? `${(el.value / 1000).toFixed(2)} km` : '-';
};

const MheStatusPanel = ({ handleRightPanel, isShowPanel, vehicle }) => {
  const { vehicles } = useSelector((state) => state.vehicle);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const v = vehicles?.data.find((x) => x.id === vehicle?.id);

  useEffect(() => {
    setCurrentDateTime(moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm'));
  }, []);

  const status = getStatus(v);

  const details = [
    ['Vehicle Name', v?.vehicle_name ?? '-'],
    ['Vehicle Number', v?.vehicle_number ?? '-'],
    ['Route Name', v?.routes?.[0]?.name ?? '-'],
    ['Total Distance', getOdo(v)],
    ['Total Seats', v?.seats ?? '-'],
    ['Assigned Seats', v?.routes?.[0]?.total_assigned_seat ?? '-'],
    ['Onboarded Employee', '-'],
    ['Speed', v?.speed ?? v?.speed_limit ?? '-'],
    ['Driver Name', v?.driver ? `${v.driver.first_name || ''} ${v.driver.last_name || ''}`.trim() : '-'],
    ['Driver Number', v?.driver?.phone_number ?? '-'],
  ];

  return (
    <>
      {isShowPanel && (
        <div className='fixed top-1/2 z-[100000] -translate-y-1/2 transition-all duration-300 left-[calc(100vw-385px)]'>
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
        className={`fixed transition-all top-6 ${isShowPanel ? 'right-0' : 'right-[-340px]'}
        w-[360px] rounded-xl bg-white z-[99999] shadow-2xl border border-gray-200 overflow-hidden`}
        style={{ transition: 'right 0.3s' }}>
        <div className='flex flex-col items-center bg-gradient-to-r from-[#1d31a6] to-[#3b5998] py-4 px-4 border-b border-gray-200'>
          <p className='font-bold text-lg text-white mb-1 truncate w-full text-center'>{v?.vehicle_name ?? '-'}</p>
          <div className='flex justify-between items-center w-full gap-2 mt-2'>
            <span
              className='px-3 py-1 rounded-full text-xs font-semibold shadow'
              style={{
                backgroundColor: statusColorMap[status] || '#000',
                color: '#fff',
                minWidth: 80,
                textAlign: 'center',
                letterSpacing: 1,
              }}>
              {status}
            </span>
            <span className='bg-white text-[#1d31a6] px-3 py-1 rounded-full text-xs font-semibold shadow border border-[#1d31a6]'>
              {currentDateTime}
            </span>
          </div>
        </div>

        <div className='details-panel py-4 px-4 bg-gray-50 min-h-[340px]'>
          <div className='grid grid-cols-1 gap-3'>
            {details.map(([label, value]) => (
              <div
                key={label}
                className='flex justify-between items-center bg-white rounded-md px-3 py-2 shadow-sm border border-gray-100'>
                <span className='text-gray-500 font-medium text-[12px]'>{label}</span>
                <span className='text-gray-900 font-semibold text-[12px]'>{value || '-'}</span>
              </div>
            ))}
          </div>

          <div className='flex flex-wrap justify-center gap-2 mt-7 w-full'>
            <Link to='/report/parked'>
              <Btn>Reports</Btn>
            </Link>
            <Link to='/master/vehicle'>
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

const Btn = ({ children }) => (
  <button className='bg-gradient-to-r from-[#1d31a6] to-[#3b5998] px-3 py-1.5 text-white rounded-lg text-[12px] font-semibold shadow hover:from-[#3b5998] hover:to-[#1d31a6] transition-all duration-150 cursor-pointer'>
    {children}
  </button>
);

export default MheStatusPanel;
