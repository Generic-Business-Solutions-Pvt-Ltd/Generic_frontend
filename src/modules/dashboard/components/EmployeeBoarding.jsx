import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmpBoardingData } from '../actions/empBoardingAction';
import EmployeeBoardingBarChart from '../charts/EmployeeBoardingBarChart';

export default function EmployeeBoarding() {
  const dispatch = useDispatch();
  const { previousData, currentData, days } = useSelector((s) => s.empBoardingStatus);

  useEffect(() => {
    fetchEmpBoardingData(dispatch);
  }, [dispatch]);

  return (
    <div className='shadow-sm rounded-sm bg-white w-full pb-0 p-3'>
      <EmployeeBoardingBarChart
        previousData={previousData}
        currentData={currentData}
        categories={days}
        text='Employee Boarding'
      />
    </div>
  );
}
