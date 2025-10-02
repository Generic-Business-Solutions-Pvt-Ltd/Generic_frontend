import { APIURL } from '../../../constants';
import { ApiService } from '../../../services';
import { setCurrentData, setDays, setPreviousData } from '../../../redux/lateArrivalSlice';

export const fetchLateArrivalData = async (dispatch) => {
  try {
    const company_id = localStorage.getItem('company_id');
    const res = await ApiService.get(APIURL.LATEARRIVAL, { company_id });
    const weekChart = res?.data?.weekChart || [];
    if (res?.success) {
      dispatch(setPreviousData(weekChart.map((e) => e.previous)));
      dispatch(setCurrentData(weekChart.map((e) => e.current)));
      dispatch(setDays(weekChart.map((e) => e.day)));
    } else {
      console.error('Failed to fetch late arrival data.');
    }
  } catch (err) {
    console.error('Error fetching late arrival data:', err);
  }
};
