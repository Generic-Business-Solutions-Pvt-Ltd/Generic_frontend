import { APIURL } from '../../../constants';
import { ApiService } from '../../../services';
import { setCurrentData, setDays, setPreviousData } from '../../../redux/overspeedStatusSlice';

export const fetchOverspeedData = async (dispatch) => {
  try {
    const company_id = localStorage.getItem('company_id');
    const res = await ApiService.get(APIURL.OVERSPEEDVIOLATION, { company_id });
    const weekChart = res?.data?.weekChart || [];
    if (res?.success) {
      dispatch(setPreviousData(weekChart.map((e) => e.previous)));
      dispatch(setCurrentData(weekChart.map((e) => e.current)));
      dispatch(setDays(weekChart.map((e) => e.day)));
    } else {
      console.error('Failed to fetch overspeed violation data.');
    }
  } catch (err) {
    console.error('Error fetching overspeed violation data:', err);
  }
};
