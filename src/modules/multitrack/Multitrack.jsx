import { useDispatch } from 'react-redux';
import { APIURL } from '../../constants';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Lastvehicledata } from '../../services';
import MapComponent from './components/MapComponent';
import TrackingPanel from './components/TrackingPanel';
import MheStatusPanel from './components/MheStatusPanel';
import { fetchLastVehicles, fetchVehicles } from '../../redux/vehicleSlice';

export default function Multitrack() {
  const dispatch = useDispatch();
  const [showPanel, setShowPanel] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const fetchDataRef = useRef();

  const handleRightPanel = useCallback((vehicle) => {
    setSelectedVehicle((prevVehicle) => {
      if (prevVehicle?.id === vehicle?.id) {
        setShowPanel(false);
        return null;
      }
      setShowPanel(true);
      return vehicle;
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    let isFetching = false;

    const fetchData = async () => {
      if (isFetching) return;
      isFetching = true;

      const token = localStorage.getItem('authToken');
      const company_id = localStorage.getItem('company_id');

      if (!token || !company_id) {
        isFetching = false;
        return;
      }

      try {
        const res = await dispatch(fetchVehicles({ limit: 100 }));
        const vehicles = res?.payload?.data?.vehicles || [];
        const imeis = vehicles.map((v) => v.imei_number).filter(Boolean);

        if (!imeis.length) {
          isFetching = false;
          return;
        }

        try {
          const batchRes = await Lastvehicledata.get(`${APIURL.LASTVEHICLEDATA}?imei=${imeis.join(',')}`);
          if (batchRes?.success && Array.isArray(batchRes.data) && batchRes.data.length) {
            if (isMounted) dispatch(fetchLastVehicles(batchRes.data));
          }
        } catch {
          const chunkSize = 10;
          for (let i = 0; i < imeis.length; i += chunkSize) {
            const chunk = imeis.slice(i, i + chunkSize);
            const results = await Promise.all(
              chunk.map((imei) => Lastvehicledata.get(`${APIURL.LASTVEHICLEDATA}?imei=${imei}`).catch(() => null))
            );
            const validData = results.flatMap((r) => (r?.success ? r.data : []));
            if (validData.length && isMounted) dispatch(fetchLastVehicles(validData));
          }
        }
      } catch (error) {
        console.error('Error fetching vehicle data:', error);
      } finally {
        isFetching = false;
      }
    };

    fetchDataRef.current = fetchData;
    fetchData();

    const intervalId = setInterval(() => {
      if (fetchDataRef.current) fetchDataRef.current();
    }, 100000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [dispatch]);

  return (
    <div className='relative flex-1 h-screen rounded-md'>
      <TrackingPanel handleRightPanel={handleRightPanel} />
      <MapComponent selectedVehicle={selectedVehicle} />
      {showPanel && selectedVehicle && (
        <MheStatusPanel handleRightPanel={handleRightPanel} isShowPanel={showPanel} vehicle={selectedVehicle} />
      )}
    </div>
  );
}
