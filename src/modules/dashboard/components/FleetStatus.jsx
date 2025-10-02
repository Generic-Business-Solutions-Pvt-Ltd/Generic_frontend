import { useSelector } from 'react-redux';
import movingVehicle from '../../../assets/moving_vehicle.svg';
import idleVehicle from '../../../assets/idle_vehicle.svg';
import parkedVehicle from '../../../assets/parked_vehicle.svg';

const VEHICLE_STATUS = [
  { img: movingVehicle, label: 'Moving', key: 'runningDevices' },
  { img: idleVehicle, label: 'Idle', key: 'idelDevices' },
  { img: parkedVehicle, label: 'Parked', key: 'parkedDevices' },
];

export default function FleetStatus() {
  const status = useSelector((s) => s.multiTrackStatus);
  return (
    <div className='shadow-sm rounded-sm bg-white w-full p-3'>
      <p className='pb-3 text-sm'>Status of the fleet</p>
      <hr className='border-gray-100' />
      <p className='py-3 text-sm'>Currently, there are</p>
      <div className='my-4 flex justify-between items-center'>
        {VEHICLE_STATUS.map(({ img, label, key }) => (
          <div key={key} className='w-1/3 flex flex-col items-center'>
            <img src={img} alt={label} />
            <span>{status[key]?.length || 0}</span>
            <p className='text-sm'>{label} Vehicles</p>
          </div>
        ))}
      </div>
    </div>
  );
}
