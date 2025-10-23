const isOneHourOld = (date) => {
  const t = new Date(date);
  return !date || isNaN(t) ? false : Date.now() - t.getTime() > 3600000;
};

const colorOfDot = (ign, mov, time) => {
  if (isOneHourOld(time)) return 'rgb(0,0,255)';
  if (ign && mov) return 'rgb(0,128,0)';
  if (ign && !mov) return 'rgb(255, 255, 0)';
  if (!ign && !mov) return 'rgb(255, 0, 0)';
};

const getOdo = (v) => {
  const el = v?.ioElements?.find((e) => e.propertyName === 'totalOdometer');
  return el && Number(el.value) ? `${(el.value / 1000).toFixed(2)} km` : '-';
};

export const processVehicles = (vehicles) => {
  const devices = (vehicles || []).filter(Boolean).map((v) => {
    const io = Array.isArray(v.ioElements) ? v.ioElements : [];
    const get = (id) => io.find((i) => i.id === id)?.value ?? 0;
    const ignition = get(239) === 1;
    const movement = get(240) === 1;
    const localTime = v.timestamp && !isNaN(new Date(v.timestamp)) ? new Date(v.timestamp).toISOString() : '';

    const status = isOneHourOld(localTime)
      ? 'Offline'
      : ignition && movement
      ? 'Running'
      : ignition
      ? 'Idle'
      : !ignition && !movement
      ? 'Parked'
      : 'Unknown';

    return {
      id: v.vehicle_id || v.id || '-',
      vehicle_name: v.vehicle_name ?? '-',
      vehicle_number: v.vehicle_number ?? '-',
      route_name:
        Array.isArray(v.routes) && v.routes.length > 0 ? v.routes[0]?.name ?? '-' : v.route_details?.[0]?.name ?? '-',
      total_distance: getOdo(v),
      seats: v.seats ?? '-',
      assigned_seats:
        v.route_details?.[0]?.total_assigned_seat ??
        (Array.isArray(v.routes) && v.routes[0]?.total_assigned_seat) ??
        '-',
      onboarded_employee: '-',
      speed: typeof v.speed === 'number' ? `${v.speed} km/h` : '-',
      driver_name: v.driver_name ?? v.driver ?? '-',
      driver_number: v.driver_number ?? v.driver?.number ?? '-',
      address: v.address ?? '-',
      timestamp: localTime,
      speed_limit: v.speed || 0,
      lat: v.latitude || 0,
      lng: v.longitude || 0,
      hasGPS: v.latitude != null && v.longitude != null,
      hasIgnition: ignition,
      hasBattery: get(68) > 0,
      hasExternalPower: get(66) > 0,
      movement,
      color: colorOfDot(ignition, movement, localTime),
      isOffline: isOneHourOld(localTime),
      status,
    };
  });

  return {
    devices,
    runningDevices: devices.filter((d) => d.status === 'Running'),
    idelDevices: devices.filter((d) => d.status === 'Idle'),
    parkedDevices: devices.filter((d) => d.status === 'Parked'),
    offlineVehicleData: devices.filter((d) => d.status === 'Offline'),
  };
};
