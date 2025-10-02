import { CheckBox } from '@mui/icons-material';
import ArrowLeftIcon from '@mui/icons-material/ArrowBackIos';
import ArrowRightIcon from '@mui/icons-material/ArrowForwardIos';
import { useState, useMemo, useEffect, useRef } from 'react';
import { FaBatteryFull, FaBolt, FaKey, FaWifi } from 'react-icons/fa';
import ISearch, { LateSvg, OnTimeSvg, TotalSvg } from './ISearch';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { setActiveTab, setIsTrackShow, setProcessedVehicles } from '../../../redux/multiTrackSlice';

const statusTabs = [
  { label: 'Running', bg: '#00800026', color: 'green' },
  { label: 'Idle', bg: '#FFC10726', color: '#ce9a00' },
  { label: 'Parked', bg: '#FF000026', color: 'red' },
  { label: 'Offline', bg: '#000DFF26', color: 'blue' },
  { label: 'New', bg: '#ececec', color: 'gray' },
  { label: 'All', bg: '#d9d9d9', color: 'black' },
];

const iconStatus = [
  { Icon: FaWifi, key: (d) => (d.lat ? d.lat !== 0 : null) },
  { Icon: FaKey, key: (d) => (d.lat ? d.hasIgnition : null) },
  { Icon: FaBatteryFull, key: (d) => (d.lat ? d.hasBattery : null) },
  { Icon: FaBolt, key: (d) => (d.lat ? d.hasExternalPower : null) },
];

const selectTrackingPanelState = (s) => ({
  vehicles: s.vehicle.vehicles,
  newDevices: s.vehicle.newDevices,
  running: s.multiTrackStatus.runningDevices,
  parked: s.multiTrackStatus.parkedDevices,
  idle: s.multiTrackStatus.idelDevices,
  devices: s.multiTrackStatus.devices,
  activeTab: s.multiTrackStatus.activeTab,
  offline: s.multiTrackStatus.offlineVehicleData,
  isTrackShow: s.multiTrackStatus.isTrackShow,
});

const StatCard = ({ icon, label, value, bg, color }) => (
  <div className={`flex flex-row w-1/3 items-center gap-2 shadow-sm`} style={{ background: bg }}>
    <div className='pl-2'>{icon}</div>
    <div>
      <p className='text-sm' style={{ color }}>
        {label}
      </p>
      <p className='text-sm' style={{ color }}>
        {value}
      </p>
    </div>
  </div>
);

const TrackingPanel = ({ handleRightPanel }) => {
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  const { vehicles, newDevices, running, parked, idle, devices, activeTab, offline, isTrackShow } = useSelector(
    selectTrackingPanelState,
    shallowEqual
  );

  const lastDataRef = useRef();
  useEffect(() => {
    const data = vehicles?.data;
    if (Array.isArray(data) && data.length && lastDataRef.current !== data) {
      dispatch(setProcessedVehicles(data));
      lastDataRef.current = data;
    }
  }, [vehicles?.data, dispatch]);

  const tabCounts = useMemo(
    () => ({
      Running: running.length,
      Idle: idle.length,
      Parked: parked.length,
      Offline: offline.length,
      New: newDevices.length,
      All: vehicles?.data?.length || devices.length,
    }),
    [running, idle, parked, offline, newDevices, vehicles?.data, devices.length]
  );

  const filteredDevices = useMemo(
    () =>
      ({
        Running: running,
        Idle: idle,
        Parked: parked,
        Offline: offline,
        New: newDevices,
        All: devices,
      }[activeTab] || []),
    [activeTab, running, idle, parked, offline, newDevices, devices]
  );

  const shownDevices = useMemo(
    () =>
      !search
        ? filteredDevices
        : filteredDevices.filter((d) => d.vehicle_name?.toLowerCase().includes(search.toLowerCase())),
    [search, filteredDevices]
  );

  return (
    <div
      className={`absolute transition-all top-0 rounded-md bg-white h-[calc(100vh-30px)] p-3 z-[99999] ${
        isTrackShow ? '-left-[452px]' : 'left-0'
      } w-[452px]`}>
      <div
        className='absolute top-10 -right-5 h-14 bg-[#FFF] cursor-pointer rounded-tr-lg rounded-br-lg text-4xl flex items-center justify-center'
        onClick={() => dispatch(setIsTrackShow(!isTrackShow))}>
        {isTrackShow ? <ArrowRightIcon /> : <ArrowLeftIcon />}
      </div>
      <div className='w-full rounded-sm overflow-hidden mb-2 flex justify-between items-center relative'>
        <StatCard icon={<TotalSvg />} label='Total' value={vehicles?.data?.length || 0} bg='#e7e5e6' />
        <StatCard icon={<OnTimeSvg />} label='On time' value='-' bg='#00800026' color='#0e7c13' />
        <StatCard icon={<LateSvg />} label='Late' value='-' bg='#FF000026' color='#d70b0b' />
      </div>
      <div className='border border-[#1d31a6] rounded-md h-[666px] relative'>
        <div className='flex'>
          {statusTabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => dispatch(setActiveTab(tab.label))}
              className={`flex-1 flex flex-col items-center cursor-pointer p-1 h-13 rounded-tr-md transition-all duration-200 ${
                activeTab === tab.label ? 'border-b-4' : ''
              }`}
              style={{
                background: tab.bg,
                borderColor: activeTab === tab.label ? tab.color : 'transparent',
                borderBottomWidth: activeTab === tab.label ? 3 : 0,
              }}>
              <span style={{ color: tab.color }}>{tabCounts[tab.label]}</span>
              <span style={{ color: tab.color, fontSize: 11 }}>{tab.label === 'New' ? 'New Device' : tab.label}</span>
            </button>
          ))}
        </div>
        <div className='p-1 border-b border-gray-300'>
          <ISearch onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className='mhe-list p-2 mt-2 h-[555px] overflow-y-scroll'>
          {shownDevices.map((device) => (
            <div
              key={device.id}
              className='flex items-center border-b border-gray-200 py-1 last:border-none cursor-pointer'>
              <CheckBox fontSize='small' sx={{ marginRight: '10px' }} />
              <div className='h-2 w-2 rounded-full mr-4' style={{ background: device.color }} />
              <div className='flex-1'>
                <div className='text-sm' onClick={() => handleRightPanel(device)}>
                  {device.vehicle_name}
                </div>
                {device.timestamp && (
                  <div className='text-gray-500 text-xs'>{new Date(device.timestamp).toLocaleString()}</div>
                )}
              </div>
              <span className='w-8 text-center text-sm'>{device.speed}</span>
              {iconStatus.map(({ Icon, key }, i) => {
                const status = key(device);
                let cls = 'text-gray-400 text-[15px]';
                if (status !== null) cls = status ? 'text-green-600 text-[15px]' : 'text-red-400 text-[15px]';
                return (
                  <span key={i} className='w-8 text-center'>
                    <Icon className={cls} />
                  </span>
                );
              })}
              <span className='ml-4 text-sm text-gray-600'>{device.address}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrackingPanel;
