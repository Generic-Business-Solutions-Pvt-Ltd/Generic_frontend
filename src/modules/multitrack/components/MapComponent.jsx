import L from 'leaflet';
import { useRef, useMemo, useEffect } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { MapContainer, TileLayer, Marker, Popup, useMap, ScaleControl, ZoomControl, Circle } from 'react-leaflet';

import GreenPin from '../../../assets/greenLocationPin.svg';
import RedPin from '../../../assets/redLocationPin.svg';
import OrangePin from '../../../assets/orangeLocationPin.svg';
import BluePin from '../../../assets/blueLocationPin.svg';

const icons = {
  Moving: new L.Icon({ iconUrl: GreenPin, iconSize: [32, 32], iconAnchor: [16, 32] }),
  Parked: new L.Icon({ iconUrl: RedPin, iconSize: [32, 32], iconAnchor: [16, 32] }),
  Idle: new L.Icon({ iconUrl: OrangePin, iconSize: [32, 32], iconAnchor: [16, 32] }),
  Offline: new L.Icon({ iconUrl: BluePin, iconSize: [32, 32], iconAnchor: [16, 32] }),
  default: new L.Icon({ iconUrl: BluePin, iconSize: [32, 32], iconAnchor: [16, 32] }),
};

const statusClassColor = {
  Moving: 'bg-green-100 text-green-700',
  Parked: 'bg-red-100 text-red-700',
  Idle: 'bg-orange-100 text-orange-700',
  Offline: 'bg-blue-100 text-blue-700',
  New: 'bg-gray-100 text-gray-700',
  Unknown: 'bg-gray-100 text-gray-700',
};

const getStatusCls = (status) => statusClassColor[status?.trim?.()] || statusClassColor.Unknown;
const getPinIcon = (status) => icons[status?.trim?.()] || icons.default;

const selectAllDisplayDevices = (s) => [
  ...(s.multiTrackStatus.runningDevices || []),
  ...(s.multiTrackStatus.idelDevices || []),
  ...(s.multiTrackStatus.parkedDevices || []),
  ...(s.multiTrackStatus.offlineVehicleData || []),
  ...(s.multiTrackStatus.newDevices || []),
];

function MapEffects({ selectedVehicle, markerRefs }) {
  const map = useMap();
  useEffect(() => {
    if (selectedVehicle && markerRefs.current[selectedVehicle.id]) {
      markerRefs.current[selectedVehicle.id].openPopup();
      map.flyTo([selectedVehicle.lat, selectedVehicle.lng], 16, { animate: true, duration: 1.2 });
    }
  }, [selectedVehicle, markerRefs, map]);
  return null;
}

const DEFAULT_CENTER = [20.5937, 78.9629];

const MapComponent = ({ selectedVehicle }) => {
  const markerRefs = useRef({});
  const allDevices = useSelector(selectAllDisplayDevices, shallowEqual);

  const devices = useMemo(() => {
    if (selectedVehicle) {
      return [
        {
          id: selectedVehicle.id,
          name: selectedVehicle.vehicle_name ?? selectedVehicle.name ?? '-',
          lat: selectedVehicle.lat,
          lng: selectedVehicle.lng,
          icon: getPinIcon(selectedVehicle.status),
          timestamp: selectedVehicle.timestamp || '',
          address: selectedVehicle.address || '',
          speed: selectedVehicle.speed,
          cls: getStatusCls(selectedVehicle.status),
          label: selectedVehicle.status ?? 'Unknown',
        },
      ];
    }
    return (allDevices || [])
      .filter((d) => d && typeof d.lat === 'number' && typeof d.lng === 'number')
      .map((d) => ({
        id: d.id,
        name: d.vehicle_name ?? d.name ?? '-',
        lat: d.lat,
        lng: d.lng,
        icon: getPinIcon(d.status),
        timestamp: d.timestamp || '',
        address: d.address || '',
        speed: d.speed,
        cls: getStatusCls(d.status),
        label: d.status ?? 'Unknown',
      }));
  }, [selectedVehicle, allDevices]);

  const mapCenter = useMemo(() => {
    if (selectedVehicle?.lat && selectedVehicle?.lng) return [selectedVehicle.lat, selectedVehicle.lng];
    if (devices.length === 1) return [devices[0].lat, devices[0].lng];
    if (devices.length > 1) {
      const avg = devices.reduce((acc, d) => [acc[0] + d.lat, acc[1] + d.lng], [0, 0]);
      return [avg[0] / devices.length, avg[1] / devices.length];
    }
    return DEFAULT_CENTER;
  }, [selectedVehicle, devices]);

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
        {devices.map((d, idx) => (
          <Marker
            key={`${d.id ?? 'noid'}_${idx}`}
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
                  <span className={`inline-block px-2 py-1 rounded text-xs ${d.cls}`}>{d.label}</span>
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
