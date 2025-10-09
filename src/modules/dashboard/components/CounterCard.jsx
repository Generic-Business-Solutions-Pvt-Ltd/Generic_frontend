import { Link } from 'react-router-dom';
import { useSelector, shallowEqual } from 'react-redux';
import runningBusIcon from '../../../assets/running_bus.svg';
import emergencyAlert from '../../../assets/emergency_alerts.svg';
import employeeOnboarded from '../../../assets/employee_onboard.svg';

const selectCounterCardState = (state) => ({
  runningDevices: state.multiTrackStatus.runningDevices,
  onboardEmployees: state.employee.onboardEmployees,
  todayEmergency: state.emergencyReportAlert.todayEmergency,
});

export default function CounterCard() {
  const { runningDevices, onboardEmployees, todayEmergency } = useSelector(selectCounterCardState, shallowEqual);

  const cards = [
    {
      id: 'vehicles',
      label: 'Total Vehicle Running',
      value: runningDevices.length,
      icon: runningBusIcon,
      link: '/master/vehicle',
      iconWidth: 'w-14',
    },
    {
      id: 'onboard',
      label: 'Employee Onboarded',
      value: Array.isArray(onboardEmployees) ? onboardEmployees.length : 0,
      icon: employeeOnboarded,
      link: '/report/employees-on-board',
      iconWidth: 'w-8',
    },
    {
      id: 'emergency',
      label: 'Emergency Alerts Today',
      value: typeof todayEmergency === 'number' ? todayEmergency : 0,
      icon: emergencyAlert,
      link: '/report/emergency-alert',
      iconWidth: 'w-8',
    },
  ];

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
      {cards.map(({ id, label, value, icon, link, iconWidth }) => (
        <Link key={id} to={link} className='flex items-center bg-white rounded shadow p-3 hover:bg-gray-50 transition'>
          <img src={icon} alt='' className={`${iconWidth} h-8`} />
          <div className='ml-4'>
            <div className='text-xs text-gray-500'>{label}</div>
            <div className='text-lg font-bold'>{value}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}

// import { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import runningBusIcon from '../../../assets/running_bus.svg';
// import emergencyAlert from '../../../assets/emergency_alerts.svg';
// import employeeOnboarded from '../../../assets/employee_onboard.svg';
// import { ApiService } from '../../../services';
// import { APIURL } from '../../../constants';

// function useDashboardTotalCount() {
//   const [data, setData] = useState({ total_vehicle_running: 0, employee_onboarded: 0, emergency_today: 0 });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     ApiService.get(APIURL.TOTALCOUNT).then((res) => {
//       if (res?.success) setData(res.data);
//       setLoading(false);
//     });
//   }, []);
//   return { data, loading };
// }

// export default function CounterCard() {
//   const { data, loading } = useDashboardTotalCount();
//   const cards = [
//     {
//       id: 'vehicles',
//       label: 'Total Vehicle Running',
//       value: data.total_vehicle_running || 0,
//       icon: runningBusIcon,
//       link: '/master/vehicle',
//       iconWidth: 'w-14',
//     },
//     {
//       id: 'onboard',
//       label: 'Employee Onboarded',
//       value: data.employee_onboarded || 0,
//       icon: employeeOnboarded,
//       link: '/report/employees-on-board',
//       iconWidth: 'w-8',
//     },
//     {
//       id: 'emergency',
//       label: 'Emergency Alerts Today',
//       value: data.emergency_today || 0,
//       icon: emergencyAlert,
//       link: '/report/emergency-alert',
//       iconWidth: 'w-8',
//     },
//   ];
//   return (
//     <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
//       {cards.map(({ id, label, value, icon, link, iconWidth }) => (
//         <Link key={id} to={link} className='flex items-center bg-white rounded shadow p-3 hover:bg-gray-50 transition'>
//           <img src={icon} alt='' className={`${iconWidth} h-8`} />
//           <div className='ml-4'>
//             <div className='text-xs text-gray-500'>{label}</div>
//             <div className='text-lg font-bold'>
//               {loading ? <span className='animate-pulse text-gray-300'>--</span> : value}
//             </div>
//           </div>
//         </Link>
//       ))}
//     </div>
//   );
// }
