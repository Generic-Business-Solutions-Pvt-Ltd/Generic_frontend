import OsmMap from './components/OsmMap';
import { useEffect, useState } from 'react';
import { useMapEvents } from 'react-leaflet';
import { useLocation } from 'react-router-dom';
import GeofenceCreateForm from './components/GeofenceCreateForm';

export default function GeofenceCreate() {
  const { state } = useLocation();
  const [cordinates, setCoordinates] = useState([]);
  const [selectedColor, setSelectedColor] = useState('#2196F3');

  const MapEvents = () => {
    useMapEvents({
      click: ({ latlng }) => setCoordinates((prev) => [...prev, [latlng.lat, latlng.lng]]),
    });
    return null;
  };

  useEffect(() => {
    if (state?.rowData) {
      setCoordinates(state?.rowData?.coordinates?.map((c) => c.split(',').map(Number)));
      setSelectedColor(state?.rowData?.color);
    }
  }, [state]);

  return (
    <div className='w-full h-full p-2'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Vehicle Geofence</h1>
      </div>
      <div className='grid grid-col-1 gap-3'>
        <div className='bg-white rounded-sm border-t-3 border-[#07163d]'>
          <div className='p-5'>
            <div className='flex flex-col-reverse md:grid md:grid-cols-3 gap-3'>
              <div className='md:col-span-1'>
                <GeofenceCreateForm
                  selectedColor={selectedColor}
                  onColorChange={setSelectedColor}
                  handleClear={() => setCoordinates([])}
                  cordinates={cordinates}
                />
              </div>
              <div className='md:col-span-2 bg-gray-100 p-5 rounded overflow-hidden'>
                <OsmMap selectedColor={selectedColor} MapEvents={MapEvents} cordinates={cordinates} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
