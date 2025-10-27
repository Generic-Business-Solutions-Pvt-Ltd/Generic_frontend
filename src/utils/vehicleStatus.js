const isOneHourOld = (date) => {
  if (!date) return false;
  const t = new Date(date);
  return !isNaN(t) && Date.now() - t.getTime() > 3600000;
};

const colorOfDot = (ign, mov, time, isNew) =>
  isNew
    ? 'gray'
    : isOneHourOld(time)
    ? 'rgb(0,0,255)'
    : ign && mov
    ? 'rgb(0,128,0)'
    : ign && !mov
    ? 'rgb(255, 255, 0)'
    : !ign && !mov
    ? 'rgb(255, 0, 0)'
    : 'gray';

const getOdo = (v) => {
  const el = v?.ioElements?.find((e) => e.propertyName === 'totalOdometer');
  return el && Number(el.value) ? `${(el.value / 1000).toFixed(2)} km` : '-';
};

export const processVehicles = (vehicles) => {
  const devices = (vehicles || []).filter(Boolean).map((v) => {
    const io = Array.isArray(v.ioElements) ? v.ioElements : [];
    const get = (id) => io.find((i) => i.id === id)?.value ?? 0;
    const ignition = get(239) === 1,
      movement = get(240) === 1;
    const hasTimestamp = !!v.timestamp && !isNaN(new Date(v.timestamp));
    const hasLat = v.latitude != null && Number(v.latitude) !== 0;
    const hasLng = v.longitude != null && Number(v.longitude) !== 0;
    const isNew = !hasTimestamp || !hasLat || !hasLng;
    const localTime = hasTimestamp ? new Date(v.timestamp).toISOString() : '';

    const getDriverName = () =>
      v.driver_name
        ? v.driver_name
        : v.driver && (v.driver.first_name || v.driver.last_name)
        ? `${v.driver.first_name ?? ''}${v.driver.last_name ? ` ${v.driver.last_name}` : ''}`.trim() || '-'
        : typeof v.driver === 'string'
        ? v.driver
        : '-';
    const getDriverNumber = () =>
      v.driver_number
        ? v.driver_number
        : v.driver?.phone_number
        ? v.driver.phone_number
        : v.driver?.number
        ? v.driver.number
        : '-';
    const getRouteName = () =>
      Array.isArray(v.routes) && v.routes[0]?.name
        ? v.routes[0].name
        : Array.isArray(v.route_details) && v.route_details[0]?.name
        ? v.route_details[0].name
        : '-';
    const getAssignedSeats = () =>
      Array.isArray(v.route_details) && v.route_details[0]?.total_assigned_seat != null
        ? v.route_details[0].total_assigned_seat
        : Array.isArray(v.routes) && v.routes[0]?.total_assigned_seat != null
        ? v.routes[0].total_assigned_seat
        : '-';

    const status = isNew
      ? 'New'
      : isOneHourOld(localTime)
      ? 'Offline'
      : ignition && movement
      ? 'Running'
      : ignition
      ? 'Idle'
      : !ignition && !movement
      ? 'Parked'
      : 'Unknown';

    const speedStr =
      typeof v.speed === 'number' || (!isNaN(Number(v.speed)) && v.speed !== null && v.speed !== undefined)
        ? `${Number(v.speed)} km/h`
        : '-';

    return {
      id: v.id ?? '-',
      vehicle_name: v.vehicle_name ?? '-',
      vehicle_number: v.vehicle_number ?? '-',
      route_name: getRouteName(),
      total_distance: getOdo(v),
      seats: v.seats ?? '-',
      assigned_seats: getAssignedSeats(),
      onboarded_employee: '-',
      speed: speedStr,
      driver_name: getDriverName(),
      driver_number: getDriverNumber(),
      address: v.address ?? '-',
      timestamp: localTime,
      speed_limit: v.speed_limit ?? v.speed ?? 0,
      lat: Number(v.latitude) || 0,
      lng: Number(v.longitude) || 0,
      hasGPS: v.latitude != null && v.longitude != null,
      hasIgnition: ignition,
      hasBattery: get(68) > 0,
      hasExternalPower: get(66) > 0,
      movement,
      color: colorOfDot(ignition, movement, localTime, isNew),
      isOffline: isOneHourOld(localTime),
      status,
    };
  });

  const pick = (s) => devices.filter((d) => d.status === s);
  return {
    devices,
    runningDevices: pick('Running'),
    idelDevices: pick('Idle'),
    parkedDevices: pick('Parked'),
    offlineVehicleData: pick('Offline'),
    newDevices: pick('New'),
  };
};
