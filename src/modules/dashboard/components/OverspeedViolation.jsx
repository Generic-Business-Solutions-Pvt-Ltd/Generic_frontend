import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOverspeedData } from '../actions/overspeedAction';
import OverspeedViolationLineChart from '../charts/OverspeedViolationLineChart';

export default function OverspeedViolation() {
  const dispatch = useDispatch();
  const { previousData, currentData, days } = useSelector((s) => s.overspeedStatus);

  useEffect(() => {
    fetchOverspeedData(dispatch);
  }, [dispatch]);

  return (
    <div className='shadow-sm rounded-sm bg-white w-full pb-0 p-3'>
      <OverspeedViolationLineChart
        previousData={previousData}
        currentData={currentData}
        categories={days}
        text='Overspeed Violation'
      />
    </div>
  );
}
