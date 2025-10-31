const isOneHourOld = (d) => !!d && !isNaN((d = new Date(d))) && Date.now() - d > 3600000;

const colorOfDot = (ign, mov, time, isNew) =>
  isNew
    ? 'gray'
    : isOneHourOld(time)
    ? 'rgb(0,0,255)'
    : ign && mov
    ? 'rgb(0,128,0)'
    : ign
    ? 'rgb(255,255,0)'
    : !ign && !mov
    ? 'rgb(255,0,0)'
    : 'gray';

const getOdo = (val) => (typeof val === 'number' && !isNaN(val) ? `${val.toFixed(2)} km` : '-');

export const processVehicles = (vehicles) => {
  const devs = (vehicles || []).filter(Boolean).map((v) => {
    const io = Array.isArray(v.ioElements) ? v.ioElements : [],
      get = (id) => io.find((i) => i.id === id)?.value ?? 0,
      ign = get(239) === 1,
      mov = get(240) === 1,
      hasTs = !!v.timestamp && !isNaN(new Date(v.timestamp)),
      hasLat = v.latitude != null && +v.latitude !== 0,
      hasLng = v.longitude != null && +v.longitude !== 0,
      isNew = !hasTs || !hasLat || !hasLng,
      localTime = hasTs ? new Date(v.timestamp).toISOString() : '',
      getName = () => [v.driver?.first_name, v.driver?.last_name].filter(Boolean).join(' ') || '-',
      getNum = () => v.driver?.phone_number ?? '-',
      getRoute = () => v.routes?.[0]?.name ?? '-',
      status = isNew
        ? 'New'
        : isOneHourOld(localTime)
        ? 'Offline'
        : ign && mov
        ? 'Running'
        : ign
        ? 'Idle'
        : !ign && !mov
        ? 'Parked'
        : 'Unknown',
      speedStr =
        typeof v.speed === 'number' || (!isNaN(Number(v.speed)) && v.speed != null) ? `${Number(v.speed)} km/h` : '-';
    const todayDistance = v.todayDistance?.distanceKm ?? v.today_distance ?? null;
    const odoNum = io.find((e) => e.propertyName === 'totalOdometer')?.value;
    return {
      id: v.id ?? '-',
      vehicle_name: v.vehicle_name ?? '-',
      vehicle_number: v.vehicle_number ?? '-',
      route_name: getRoute(),
      total_distance: getOdo(typeof odoNum === 'number' ? odoNum / 1000 : undefined),
      today_distance: getOdo(todayDistance),
      seats: v.seats ?? '-',
      assigned_seats: v.AssignedSeats ?? '-',
      onboarded_employee: v.EmployeeOnboardCount ?? '-',
      speed: speedStr,
      driver_name: getName(),
      driver_number: getNum(),
      address: v.address ?? '-',
      timestamp: localTime,
      speed_limit: v.speed_limit ?? v.speed ?? 0,
      lat: +v.latitude || 0,
      lng: +v.longitude || 0,
      hasGPS: v.latitude != null && v.longitude != null,
      hasIgnition: ign,
      hasBattery: get(68) > 0,
      hasExternalPower: get(66) > 0,
      movement: mov,
      color: colorOfDot(ign, mov, localTime, isNew),
      isOffline: isOneHourOld(localTime),
      status,
    };
  });
  const pick = (s) => devs.filter((d) => d.status === s);
  return {
    devices: devs,
    runningDevices: pick('Running'),
    idelDevices: pick('Idle'),
    parkedDevices: pick('Parked'),
    offlineVehicleData: pick('Offline'),
    newDevices: pick('New'),
  };
};
