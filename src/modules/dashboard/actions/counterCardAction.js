import { APIURL } from '../../../constants';
import { ApiService } from '../../../services';
import { setTodayEmergency, setTotalOnboardEmp } from '../../../redux/counterCardSlice';

export const fetchEmployeeOnboard = async (dispatch) => {
  const empOnboardRes = await ApiService.get(APIURL.COUNTONBOARDEMP);

  if (empOnboardRes?.success) {
    let total = 0;
    empOnboardRes.data.forEach((data) => {
      const vehicleRoute = data.Vehicle_Route;
      if (vehicleRoute && vehicleRoute.length > 0) total += vehicleRoute[0]?.onboard_employee_count || 0;
    });

    dispatch(setTotalOnboardEmp(total));
  } else {
    console.error('Failed to Fetch Employee Onboard data...');
  }
};

export const fetchEmergencyData = async (dispatch) => {
  let params = {};

  if (window.location.pathname.startsWith('/dashboard')) {
    const company_id = localStorage.getItem('company_id');
    if (company_id) params.company_id = company_id;
  }

  const emergencyRes = await ApiService.get(APIURL.DASHBOARDEMERGENCY, params);

  if (emergencyRes?.success) {
    const today = new Date().toISOString().split('T')[0];

    const todayData = emergencyRes.data.filter((item) => {
      const createdDate = new Date(item.created_at).toISOString().split('T')[0];
      return createdDate === today;
    });

    dispatch(setTodayEmergency(todayData.length));
  }
};
