import { APIURL } from '../../../constants';
import { ApiService } from '../../../services';
import { setCurrentData, setDays, setPreviousData } from '../../../redux/empBoardingStatusSlice';

export const fetchEmpBoardingData = async (dispatch) => {
  try {
    const company_id = localStorage.getItem('company_id');
    const res = await ApiService.get(APIURL.TOTALONBOARDEMP, { company_id });
    const weekChart = res?.data?.weekChart || [];
    dispatch(setPreviousData(weekChart.map((e) => e.previous)));
    dispatch(setCurrentData(weekChart.map((e) => e.current)));
    dispatch(setDays(weekChart.map((e) => e.day)));
  } catch (err) {
    console.error('Error fetching employee boarding data:', err);
  }
};
