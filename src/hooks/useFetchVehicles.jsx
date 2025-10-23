import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { fetchVehicles } from '../redux/vehicleSlice';
import { setProcessedVehicles } from '../redux/multiTrackSlice';
import { Lastvehicledata } from '../services';
import { APIURL } from '../constants';

function shallowEqual(a, b) {
  if (a === b) return true;
  if (!a || !b || typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const ka = Object.keys(a),
      kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    for (let k of ka) if (a[k] !== b[k]) return false;
    return true;
  }
  return false;
}

export const useFetchVehicles = () => {
  const dispatch = useDispatch();
  const lastDataRef = useRef();

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      const token = localStorage.getItem('authToken');
      const company_id = localStorage.getItem('company_id');
      if (!token || !company_id) return;
      try {
        const res = await dispatch(fetchVehicles({ limit: 100 }));
        const vehicles = res?.payload?.data?.vehicles || [];
        const imeis = vehicles.map((v) => v.imei_number).filter(Boolean);
        if (!imeis.length) return;
        let lastData = [];
        for (let i = 0; i < imeis.length; i += 10) {
          const chunk = imeis.slice(i, i + 10);
          const results = await Promise.all(
            chunk.map((imei) => Lastvehicledata.get(`${APIURL.LASTVEHICLEDATA}?imei=${imei}`).catch(() => null))
          );
          lastData.push(...results.flatMap((r) => (r?.success ? r.data : [])));
        }
        if (isMounted && !shallowEqual(lastDataRef.current, lastData)) {
          dispatch(setProcessedVehicles(lastData));
          lastDataRef.current = lastData;
        }
      } catch (err) {
        console.error('Error fetching vehicles:', err);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [dispatch]);
};
