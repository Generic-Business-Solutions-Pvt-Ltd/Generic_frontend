import moment from 'moment-timezone';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FilterOption from '../../../components/FilterOption';
import ReportTable from '../../../components/table/ReportTable';
import { fetchVehicleRoutes } from '../../../redux/vehicleRouteSlice';
import { fetchVehicleGeoFence, vehicleGeofenceReport } from '../../../redux/geofenceSlice';
import { exportToExcel, exportToPDF, buildExportRows } from '../../../utils/exportUtils';

const columns = [
  { key: 'created_at', header: 'Date', render: (v) => (v ? moment(v).format('YYYY-MM-DD HH:mm:ss') : '-') },
  { key: 'vehicle_number', header: 'Vehicle Number', render: (v, row) => row?.vehicle_number ?? v ?? '-' },
  { key: 'route_details', header: 'Route Details', render: (v, row) => row?.route_details ?? v ?? '-' },
  { key: 'driver_name', header: 'Driver Name', render: (v, row) => row?.driver_name ?? v ?? '-' },
  { key: 'driver_number', header: 'Driver Number', render: (v, row) => row?.driver_number ?? v ?? '-' },
  { key: 'geofence_name', header: 'Geofence Name', render: (v, row) => row?.geofence_name ?? v ?? '-' },
  { key: 'geofence_type', header: 'Geofence Type', render: (v, row) => row?.geofence_type ?? v ?? '-' },
  { key: 'no_of_visit', header: 'No. Of Visit', render: (v, row) => row?.no_of_visit ?? v ?? '-' },
];

function GeofencEntryExit() {
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [filterData, setFilterData] = useState({ geofences: [], routes: [], fromDate: '', toDate: '' });

  const company_id = localStorage.getItem('company_id');
  const { GeoFenceVehicleReport, loading, error } = useSelector((s) => s?.geofence);
  const { vehicleGeoFence } = useSelector((state) => state?.geofence);
  const { routes } = useSelector((state) => state?.vehicleRoute?.vehicleRoutes);

  useEffect(() => {
    if (company_id) dispatch(fetchVehicleRoutes({ company_id, limit: 100 }));
    dispatch(vehicleGeofenceReport({ page: page + 1, limit }));
  }, [dispatch, company_id, page, limit]);

  useEffect(() => {
    if (company_id) dispatch(fetchVehicleGeoFence({ company_id, limit: 100 }));
  }, [dispatch, company_id]);

  let data = [];
  let totalCount = 0;
  data = [].concat(GeoFenceVehicleReport?.reports || []);
  totalCount = GeoFenceVehicleReport?.pagination?.total ?? data.length;

  data = data.map((item, i) => ({
    ...item,
    id: item.id || item._id || i + 1,
    created_at: item.created_at,
    vehicle_number: item.vehicle_number ?? '-',
    route_details: item.route_details ?? '-',
    driver_name: item.driver_name ?? '-',
    driver_number: item.driver_number ?? '-',
    geofence_name: item.geofence_name ?? '-',
    geofence_type: item.geofence_type ?? '-',
    no_of_visit: item.no_of_visit ?? '-',
  }));

  const handleExport = () => {
    const rows = buildExportRows({ columns, data });
    exportToExcel({ columns, rows, fileName: 'geofence_entry_exit_report.xlsx' });
  };

  const handleExportPDF = () => {
    const rows = buildExportRows({ columns, data });
    exportToPDF({ columns, rows, fileName: 'geofence_entry_exit_report.pdf', orientation: 'landscape' });
  };

  const buildApiPayload = () => {
    const payload = { company_id };
    if (filterData.geofences?.length) payload.geofences = JSON.stringify(filterData.geofences);
    if (filterData.routes?.length) payload.routes = JSON.stringify(filterData.routes);
    if (filterData.fromDate) payload.from_date = filterData.fromDate;
    if (filterData.toDate) payload.to_date = filterData.toDate;
    return payload;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    dispatch(vehicleGeofenceReport({ ...buildApiPayload(), page: 1, limit }));
    setPage(0);
  };

  const handleFormReset = () => {
    setFilterData({ geofences: [], routes: [], fromDate: '', toDate: '' });
    setPage(0);
    dispatch(vehicleGeofenceReport({ page: 1, limit }));
  };

  return (
    <div className='w-full h-full p-2'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>GeoFence Entry-Exit Report</h1>
      </div>
      <form onSubmit={handleFormSubmit}>
        <FilterOption
          handleExport={handleExport}
          handleExportPDF={handleExportPDF}
          handleFormSubmit={handleFormSubmit}
          filterData={filterData}
          setFilterData={setFilterData}
          handleFormReset={handleFormReset}
          geofences={vehicleGeoFence?.geofences || []}
          routes={routes}
          report={true}
        />
      </form>
      <ReportTable
        columns={columns}
        data={data}
        loading={loading}
        error={error}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        limitOptions={[10, 15, 20, 25, 30]}
        totalCount={totalCount}
      />
    </div>
  );
}

export default GeofencEntryExit;
