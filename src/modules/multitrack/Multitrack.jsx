import { useState, useCallback } from 'react';
import { useFetchVehicles } from '../../hooks/useFetchVehicles';
import TrackingPanel from './components/TrackingPanel';
import MapComponent from './components/MapComponent';
import MheStatusPanel from './components/MheStatusPanel';

export default function Multitrack() {
  useFetchVehicles();

  const [showPanel, setShowPanel] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

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
