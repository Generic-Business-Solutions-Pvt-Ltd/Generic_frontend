import { useEffect, useState } from 'react';
import { APIURL } from '../../../constants';
import { ApiService } from '../../../services';
import supportIcon from '../../../assets/support.png';
import computerIcon from '../../../assets/computer.png';
import refrigeratorIcon from '../../../assets/refrigerator.png';
import VisualDisplayIcon from '../../../assets/visual_display.png';
import washigMachineIcon from '../../../assets/washing_machine.png';
import airConditionerIcon from '../../../assets/air_conditioner.png';

const icons = {
  'r&dgroup': refrigeratorIcon,
  washingmachine: washigMachineIcon,
  airconditioners: airConditionerIcon,
  visualdisplay: VisualDisplayIcon,
  comp: computerIcon,
  support: supportIcon,
};

const normalizeKey = (str) => str.toLowerCase().replace(/\s/g, '').trim();

export default function DepartmentStats() {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const company_id = localStorage.getItem('company_id');
    ApiService.get(APIURL.DEPARTMENTANALYTICS, { company_id }).then((res) => {
      if (res?.success) setDepartments(res.data);
    });
  }, []);

  return (
    <div className='shadow-sm rounded-sm bg-white w-full p-3'>
      <p className='pb-3 text-sm'>Departments Analytics</p>
      <hr className='border-gray-100' />
      <div className='my-4 grid grid-cols-3 gap-y-6'>
        {departments.slice(0, 6).map((dept, i) => (
          <div key={i} className='flex flex-col items-center'>
            <img src={icons[normalizeKey(dept.department_name)]} alt={dept.department_name} className='w-10' />
            <span>{dept.count}</span>
            <p className='text-sm'>{dept.department_name.trim()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
