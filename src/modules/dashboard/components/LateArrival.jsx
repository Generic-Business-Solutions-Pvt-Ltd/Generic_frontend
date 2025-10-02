import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LateArrivalLineChart from '../charts/LateArrivalLineChart';
import { fetchLateArrivalData } from '../actions/lateArrivalAction';

export default function LateArrival() {
  const dispatch = useDispatch();
  const { previousData, currentData, days } = useSelector((s) => s.lateArrivalStatus);

  useEffect(() => {
    fetchLateArrivalData(dispatch);
  }, [dispatch]);

  return (
    <div className='shadow-sm rounded-sm bg-white w-full pb-0 p-3'>
      <LateArrivalLineChart
        previousData={previousData}
        currentData={currentData}
        categories={days}
        text='Late Arrival'
      />
    </div>
  );
}
