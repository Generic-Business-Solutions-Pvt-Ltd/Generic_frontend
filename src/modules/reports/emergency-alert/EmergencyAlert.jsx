import moment from 'moment-timezone';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FilterOption from '../../../components/FilterOption';
import ReportTable from '../../../components/table/ReportTable';
import { fetchVehicleRoutes } from '../../../redux/vehicleRouteSlice';
import { fetchEmergencyReportAlert } from '../../../redux/emergencyReportAlertSlice';
import { exportToExcel, exportToPDF, buildExportRows } from '../../../utils/exportUtils';

const columns = [
  { key: 'date', header: 'Date', render: (value) => (value ? moment(value).format('YYYY-MM-DD') : '-') },
  { key: 'vehicleNo', header: 'Vehicle Number', render: (v, row) => row?.vehicleNo || '-' },
  { key: 'routeDetails', header: 'Route Details', render: (v, row) => row?.routeDetails || '-' },
  { key: 'driverName', header: 'Driver Name', render: (v, row) => row?.driverName || '-' },
  { key: 'driverNumber', header: 'Driver Number', render: (v, row) => row?.driverNumber || '-' },
  { key: 'employeeName', header: 'Employee Name', render: (v, row) => row?.employeeName || '-' },
  { key: 'employeeId', header: 'Employee ID', render: (v, row) => row?.employeeId || '-' },
  { key: 'plant', header: 'Plant', render: (v, row) => row?.plant || '-' },
  { key: 'department', header: 'Department', render: (v, row) => row?.department || '-' },
  {
    key: 'latlong',
    header: 'Lat-Long',
    render: (_i, row) => (row?.latitude && row?.longitude ? `${row.latitude}, ${row.longitude}` : '-'),
  },
  {
    key: 'gmap',
    header: 'G-Map',
    render: (value, row) =>
      row?.latitude && row?.longitude ? (
        <a
          href={`https://maps.google.com/?q=${row.latitude},${row.longitude}`}
          target='_blank'
          className='text-blue-700'
          rel='noopener noreferrer'>
          G-Map
        </a>
      ) : (
        '-'
      ),
  },
  { key: 'issuedRaised', header: 'Issue Raised', render: (v, row) => row?.issuedRaised || '-' },
  { key: 'actionNote', header: 'Action Note', render: (v, row) => row?.actionNote || '-' },
  { key: 'updated_at', header: 'Update Date', render: (value) => (value ? moment(value).format('YYYY-MM-DD') : '-') },
];

function EmergencyAlert() {
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [filterData, setFilterData] = useState({
    vehicles: [],
    routes: [],
    fromDate: '',
    toDate: '',
  });
  const [filteredData, setFilteredData] = useState([]);

  const company_id = localStorage.getItem('company_id');
  const { emergencyReportAlertData, loading, error } = useSelector((state) => state?.emergencyReportAlert || {});
  const { routes: vehicleRoutes } = useSelector((state) => state?.vehicleRoute?.vehicleRoutes || {});

  // Fetch vehicle routes on mount
  useEffect(() => {
    if (company_id) dispatch(fetchVehicleRoutes({ company_id, limit: 100 }));
  }, [dispatch, company_id]);

  // Fetch initial data
  useEffect(() => {
    if (company_id)
      dispatch(fetchEmergencyReportAlert({ company_id, page: page + 1, limit })).then((res) => {
        setFilteredData(Array.isArray(res?.payload?.data) ? res.payload.data : []);
      });
  }, [dispatch, company_id, page, limit]);

  // Build API payload for filter
  const buildApiPayload = () => {
    const payload = { company_id };
    if (filterData.vehicles?.length) payload.vehicles = JSON.stringify(filterData.vehicles);
    if (filterData.routes?.length) payload.routes = JSON.stringify(filterData.routes);
    if (filterData.fromDate) payload.start = filterData.fromDate;
    if (filterData.toDate) payload.end = filterData.toDate;
    payload.page = page + 1;
    payload.limit = limit;
    return payload;
  };

  // Export handlers
  const handleExport = () =>
    exportToExcel({
      columns,
      rows: buildExportRows({ columns, data: filteredData }),
      fileName: 'emergency_alert_report.xlsx',
    });

  const handleExportPDF = () =>
    exportToPDF({
      columns,
      rows: buildExportRows({ columns, data: filteredData }),
      fileName: 'emergency_alert_report.pdf',
      orientation: 'landscape',
    });

  // Filter form submit
  const handleFormSubmit = (e) => {
    e.preventDefault();
    dispatch(fetchEmergencyReportAlert(buildApiPayload())).then((res) => {
      setFilteredData(Array.isArray(res?.payload) ? res.payload : []);
    });
  };

  // Reset filter
  const handleFormReset = () => {
    setFilterData({ vehicles: [], routes: [], fromDate: '', toDate: '' });
  };

  // Map filteredData to tableData for display
  const tableData = Array.isArray(filteredData)
    ? filteredData.map((item) => {
        const latitude = item.latitude ?? '';
        const longitude = item.longitude ?? '';
        return {
          date: item.created_at || '',
          vehicleNo: item.vehicle_number || '',
          routeDetails: item.name || '',
          driverName: item.driver?.name || '',
          driverNumber: item.driver?.mobile || '',
          employeeName: item.employe?.name || '',
          employeeId: item.employe?.id || '',
          plant: item.plant_name || '',
          department: item.department_name || '',
          latitude,
          longitude,
          latlong: latitude && longitude ? `${latitude}, ${longitude}` : '',
          gmap: latitude && longitude ? `https://maps.google.com/?q=${latitude},${longitude}` : '',
          issuedRaised: item.title || '',
          actionNote: item.action_taken || '',
          updated_at: item.updated_at || '',
        };
      })
    : [];

  const totalCount = emergencyReportAlertData?.pagination?.total || filteredData.length;

  return (
    <div className='w-full h-full p-2'>
      <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Emergency Alerts Report</h1>
      <form onSubmit={handleFormSubmit}>
        <FilterOption
          handleExport={handleExport}
          handleExportPDF={handleExportPDF}
          handleFormSubmit={handleFormSubmit}
          filterData={filterData}
          setFilterData={setFilterData}
          handleFormReset={handleFormReset}
          vehicles={vehicleRoutes}
          routes={vehicleRoutes}
        />
      </form>
      <ReportTable
        columns={columns}
        data={tableData}
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

export default EmergencyAlert;
