import L from 'leaflet';
import { useSelector } from 'react-redux';
import { useRef, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ScaleControl, ZoomControl, Circle } from 'react-leaflet';

import GreenPin from '../../../assets/greenLocationPin.svg';
import RedPin from '../../../assets/redLocationPin.svg';
import OrangePin from '../../../assets/orangeLocationPin.svg';
import BluePin from '../../../assets/blueLocationPin.svg';

const icons = {
  green: new L.Icon({ iconUrl: GreenPin, iconSize: [32, 32], iconAnchor: [16, 32] }),
  red: new L.Icon({ iconUrl: RedPin, iconSize: [32, 32], iconAnchor: [16, 32] }),
  orange: new L.Icon({ iconUrl: OrangePin, iconSize: [32, 32], iconAnchor: [16, 32] }),
  blue: new L.Icon({ iconUrl: BluePin, iconSize: [32, 32], iconAnchor: [16, 32] }),
};

const getIcon = (ign, mov, t) => (isOld(t) ? icons.blue : ign && mov ? icons.green : ign ? icons.orange : icons.red);

const isOld = (date) => {
  const d = new Date(date);
  return !isNaN(d) && Date.now() - d.getTime() > 3600000;
};

function MapEffects({ selectedVehicle, markerRefs }) {
  const map = useMap();
  useEffect(() => {
    if (selectedVehicle && markerRefs.current[selectedVehicle.id]) {
      markerRefs.current[selectedVehicle.id].openPopup();
      map.flyTo([selectedVehicle.lat, selectedVehicle.lng], 16, { duration: 1.2 });
    }
  }, [selectedVehicle, markerRefs, map]);
  return null;
}

const DEFAULT_CENTER = [20.5937, 78.9629];

const statusMap = {
  [icons.green]: { label: 'Moving', cls: 'bg-green-100 text-green-700' },
  [icons.orange]: { label: 'Idle', cls: 'bg-orange-100 text-orange-700' },
  [icons.red]: { label: 'Stopped', cls: 'bg-red-100 text-red-700' },
  [icons.blue]: { label: 'Offline', cls: 'bg-blue-100 text-blue-700' },
};

const MapComponent = ({ selectedVehicle }) => {
  const { vehicles } = useSelector((s) => s.vehicle);
  const markerRefs = useRef({});

  const devices = useMemo(
    () =>
      (vehicles?.data || [])
        .filter((v) => v.latitude && v.longitude)
        .map((v) => {
          const io = v.ioElements || [];
          const ign = io.find((i) => i.id === 239)?.value;
          const mov = io.find((i) => i.id === 240)?.value;
          const icon = getIcon(ign, mov, v.timestamp);
          return {
            id: v.id,
            name: v.vehicle_name,
            lat: v.latitude,
            lng: v.longitude,
            icon,
            timestamp: v.timestamp || '',
            address: v.address || '',
            speed: v.speed,
            status: statusMap[icon] || statusMap[icons.blue],
          };
        }),
    [vehicles?.data]
  );

  const mapCenter = useMemo(
    () =>
      selectedVehicle?.lat && selectedVehicle?.lng
        ? [selectedVehicle.lat, selectedVehicle.lng]
        : devices[0]
        ? [devices[0].lat, devices[0].lng]
        : DEFAULT_CENTER,
    [selectedVehicle, devices]
  );

  return (
    <div className='h-screen w-full relative'>
      <MapContainer
        center={mapCenter}
        zoom={5}
        minZoom={1}
        maxZoom={18}
        className='w-full h-full'
        zoomControl={false}
        scrollWheelZoom
        style={{ background: '#e5e7eb' }}>
        <ZoomControl position='bottomright' />
        <ScaleControl position='bottomleft' />
        <TileLayer
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {devices.map((d) => (
          <Marker
            key={d.id}
            position={[d.lat, d.lng]}
            icon={d.icon}
            ref={(ref) => ref && (markerRefs.current[d.id] = ref)}>
            <Popup>
              <div className='min-w-[180px]'>
                <div className='font-bold text-base mb-1'>{d.name}</div>
                <div className='text-xs text-gray-600 mb-1'>
                  <span className='font-semibold'>Time:</span>{' '}
                  {d.timestamp ? new Date(d.timestamp).toLocaleString() : 'N/A'}
                </div>
                <div className='text-xs text-gray-600 mb-1'>
                  <span className='font-semibold'>Speed:</span> {d.speed ?? '-'} km/h
                </div>
                <div className='text-xs text-gray-600 mb-1'>
                  <span className='font-semibold'>Address:</span> {d.address}
                </div>
                <div className='mt-2'>
                  <span className={`inline-block px-2 py-1 rounded text-xs ${d.status.cls}`}>{d.status.label}</span>
                </div>
              </div>
            </Popup>
            {selectedVehicle && d.id === selectedVehicle.id && (
              <Circle
                center={[d.lat, d.lng]}
                radius={300}
                pathOptions={{ color: '#2563eb', fillColor: '#2563eb', fillOpacity: 0.15 }}
              />
            )}
          </Marker>
        ))}
        <MapEffects selectedVehicle={selectedVehicle} markerRefs={markerRefs} />
      </MapContainer>
    </div>
  );
};

export default MapComponent;
