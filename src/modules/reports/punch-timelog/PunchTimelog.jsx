import moment from 'moment-timezone';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlants } from '../../../redux/plantSlice';
import { useEffect, useState, useCallback } from 'react';
import FilterOption from '../../../components/FilterOption';
import ReportTable from '../../../components/table/ReportTable';
import { fetchDepartments } from '../../../redux/departmentSlice';
import { fetchPuchLogReport } from '../../../redux/punchInOutSlice';
import { fetchVehicleRoutes } from '../../../redux/vehicleRouteSlice';
import { fetchAllEmployeeDetails } from '../../../redux/employeeSlice';
import { exportToExcel, exportToPDF, buildExportRows } from '../../../utils/exportUtils';

const columns = [
  { key: 'employee_name', header: 'Employee Name', render: (_v, r) => r.onboard_employee || r.first_name || '-' },
  { key: 'punch_id', header: 'RFID Tag', render: (v, r) => r.punch_id || '-' },
  { key: 'punch_time', header: 'Punch Time', render: (v) => (v ? moment(v).format('YYYY-MM-DD hh:mm:ss A') : '-') },
  { key: 'punch_status', header: 'Punch Status', render: (v) => (v === true ? 'In' : v === false ? 'Out' : '-') },
  { key: 'vehicle_name', header: 'Vehicle Name', render: (v, r) => r.vehicle_name || '-' },
  { key: 'vehicle_number', header: 'Vehicle Number', render: (v, r) => r.vehicle_number || '-' },
  {
    key: 'location',
    header: 'Location',
    render: (_v, r) =>
      r.latitude && r.longitude ? `${Number(r.latitude).toFixed(6)}, ${Number(r.longitude).toFixed(6)}` : '-',
  },
  {
    key: 'gmap',
    header: 'Google-map',
    render: (_v, r) =>
      r.latitude && r.longitude ? (
        <a
          href={`https://maps.google.com/?q=${r.latitude},${r.longitude}`}
          target='_blank'
          className='text-blue-700'
          rel='noopener noreferrer'>
          Google Map
        </a>
      ) : (
        ''
      ),
  },
];

function PunchTimelog() {
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [filterData, setFilterData] = useState({
    routes: [],
    vehicles: [],
    fromDate: '',
    toDate: '',
    departments: [],
    employees: [],
    plants: [],
  });

  const { punchLogs, loading, error, totalCount } = useSelector((s) => s.punchInOut);
  const { departments } = useSelector((s) => s.department);
  const { employes: employees } = useSelector((s) => s.employee.getAllEmployeeDetails || []);
  const { routes } = useSelector((s) => s.vehicleRoute.vehicleRoutes);
  const { plants } = useSelector((s) => s.plant);

  useEffect(() => {
    const company_id = localStorage.getItem('company_id');
    dispatch(fetchDepartments({ limit: 100 }));
    dispatch(fetchVehicleRoutes({ limit: 100 }));
    dispatch(fetchPlants({ limit: 100 }));
    if (company_id) dispatch(fetchAllEmployeeDetails({ company_id, limit: 3000 }));
  }, [dispatch]);

  const buildApiPayload = useCallback(() => {
    const { fromDate, toDate, departments, employees, routes, vehicles, plants } = filterData;
    const company_id = localStorage.getItem('company_id');
    const payload = { company_id };

    if (departments?.length) payload.departments = JSON.stringify(departments);
    if (employees?.length) payload.employees = JSON.stringify(employees);
    if (plants?.length) payload.plants = JSON.stringify(plants);
    if (routes?.length) payload.routes = JSON.stringify(routes);
    if (vehicles?.length) payload.vehicles = JSON.stringify(vehicles);
    if (fromDate) payload.from_date = fromDate;
    if (toDate) payload.to_date = toDate;

    return payload;
  }, [filterData]);

  useEffect(() => {
    dispatch(fetchPuchLogReport({ ...buildApiPayload(), page: page + 1, limit }));
  }, [page, limit, buildApiPayload, dispatch]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    dispatch(fetchPuchLogReport({ ...buildApiPayload(), page: 1, limit }));
  };

  const handleFormReset = () => {
    const cleared = { routes: [], vehicles: [], fromDate: '', toDate: '', departments: [], employees: [], plants: [] };
    setFilterData(cleared);
    setPage(0);
    const company_id = localStorage.getItem('company_id');
    dispatch(fetchPuchLogReport({ company_id, page: 1, limit }));
  };

  const handleExport = () =>
    exportToExcel({
      columns,
      rows: buildExportRows({ columns, data: punchLogs }),
      fileName: 'punch_timelog_report.xlsx',
    });

  const handleExportPDF = () =>
    exportToPDF({
      columns,
      rows: buildExportRows({ columns, data: punchLogs }),
      fileName: 'punch_timelog_report.pdf',
      orientation: 'landscape',
    });

  return (
    <div className='w-full h-full p-2'>
      <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Punch Timelog Report (Total: {totalCount})</h1>
      <form onSubmit={handleFormSubmit}>
        <FilterOption
          handleExport={handleExport}
          handleExportPDF={handleExportPDF}
          handleFormSubmit={handleFormSubmit}
          filterData={filterData}
          setFilterData={setFilterData}
          handleFormReset={handleFormReset}
          routes={routes}
          departments={departments || []}
          vehicles={routes || []}
          employees={employees || []}
          plants={plants || []}
          report={true}
        />
      </form>
      <ReportTable
        columns={columns}
        data={punchLogs}
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

export default PunchTimelog;
