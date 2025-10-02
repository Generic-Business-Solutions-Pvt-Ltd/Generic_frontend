import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DistanceCoveredBarChart from '../charts/DistanceCoveredBarChart';
import { fetchDistanceCoverData } from '../actions/distanceCoverAction';

export default function DistanceCoveredStats() {
  const dispatch = useDispatch();
  const { previousData, currentData, days } = useSelector((s) => s.distanceCoverStatus);

  useEffect(() => {
    fetchDistanceCoverData(dispatch);
  }, [dispatch]);

  return (
    <div className='shadow-sm rounded-sm bg-white w-full pb-0 p-3'>
      <DistanceCoveredBarChart
        previousData={previousData}
        currentData={currentData}
        categories={days}
        text='Distance Covered'
      />
    </div>
  );
}
