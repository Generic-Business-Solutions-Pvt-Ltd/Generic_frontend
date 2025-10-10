import { useDispatch } from 'react-redux';
import { APIURL } from '../../constants';
import { useEffect, useState } from 'react';
import { Lastvehicledata } from '../../services';
import MapComponent from './components/MapComponent';
import TrackingPanel from './components/TrackingPanel';
import MheStatusPanel from './components/MheStatusPanel';
import { fetchLastVehicles, fetchVehicles } from '../../redux/vehicleSlice';

export default function Multitrack() {
  const dispatch = useDispatch();
  const [showPanel, setShowPanel] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    let intervalId;
    let fetched = false;

    const fetchData = async () => {
      if (fetched) return;
      fetched = true;
      const token = localStorage.getItem('authToken');
      const company_id = localStorage.getItem('company_id');
      if (!token || !company_id) return;

      const res = await dispatch(fetchVehicles({ limit: 100 }));
      const vehicles = res?.payload?.data?.vehicles || [];
      const imeis = vehicles.map((v) => v.imei_number).filter(Boolean);
      if (!imeis.length) return;

      try {
        const batchRes = await Lastvehicledata.get(`${APIURL.LASTVEHICLEDATA}?imei=${imeis.join(',')}`);
        if (batchRes?.success && Array.isArray(batchRes.data) && batchRes.data.length) {
          dispatch(fetchLastVehicles(batchRes.data));
        }
      } catch {
        const chunkSize = 10;
        for (let i = 0; i < imeis.length; i += chunkSize) {
          const chunk = imeis.slice(i, i + chunkSize);
          const results = await Promise.all(
            chunk.map((imei) => Lastvehicledata.get(`${APIURL.LASTVEHICLEDATA}?imei=${imei}`).catch(() => null))
          );
          const valid = results.filter((d) => d?.success);
          if (valid.length) dispatch(fetchLastVehicles(valid));
        }
      }
    };

    fetchData();
    intervalId = setInterval(fetchData, 60000);

    return () => clearInterval(intervalId);
  }, [dispatch]);

  const handleRightPanel = (vehicle) => {
    setShowPanel((v) => (v && vehicle?.imei === selectedVehicle?.imei ? false : true));
    setSelectedVehicle((v) => (v && vehicle?.imei === selectedVehicle?.imei ? null : vehicle));
  };

  return (
    <div className='relative flex-1 h-screen rounded-md'>
      <TrackingPanel handleRightPanel={handleRightPanel} />
      <MapComponent selectedVehicle={selectedVehicle} />
      {showPanel && (
        <MheStatusPanel handleRightPanel={handleRightPanel} isShowPanel={showPanel} vehicle={selectedVehicle} />
      )}
    </div>
  );
}
