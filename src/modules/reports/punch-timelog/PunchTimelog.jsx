import moment from 'moment-timezone';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FilterOption from '../../../components/FilterOption';
import ReportTable from '../../../components/table/ReportTable';
import { fetchPlants } from '../../../redux/plantSlice';
import { fetchDepartments } from '../../../redux/departmentSlice';
import { fetchVehicleRoutes } from '../../../redux/vehicleRouteSlice';
import { fetchEmployeeOnboard } from '../../../redux/employeeSlice';
import { exportToExcel, exportToPDF, buildExportRows } from '../../../utils/exportUtils';

const columns = [
  {
    key: 'onboard_employee',
    header: 'Employee Name',
    render: (_v, r) => [r.first_name, r.last_name].filter(Boolean).join(' ').trim() || '-',
  },
  { key: 'punch_id', header: 'RFID Tag', render: (v, r) => r.punch_id || '-' },
  {
    key: 'punch_time',
    header: 'Punch Time',
    render: (_v, r) => (r.created_at ? moment(r.created_at).format('hh:mm:ss A, DD-MM-YYYY') : '-'),
  },
  {
    key: 'punch_status',
    header: 'Punch Status',
    render: (_v, r) =>
      typeof r.punch_status !== 'undefined'
        ? r.punch_status === true
          ? 'In'
          : r.punch_status === false
          ? 'Out'
          : r.punch_status
        : '-',
  },
  {
    key: 'vehicle_name',
    header: 'Vehicle Name',
    render: (v, r) => r.vehicle_name || '-',
  },
  {
    key: 'vehicle_number',
    header: 'Vehicle Number',
    render: (v, r) => r.vehicle_number || '-',
  },
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

function EmployeeOnboard() {
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
  const [filteredData, setFilteredData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const { departments } = useSelector((s) => s.department);
  const { employes: employees } = useSelector((s) => s.employee.onboardEmployees);
  const error = useSelector((s) => s.employee.error);
  const loading = useSelector((s) => s.employee.loading);
  const { plants } = useSelector((s) => s.plant);
  const { routes } = useSelector((s) => s.vehicleRoute.vehicleRoutes);

  useEffect(() => {
    const company_id = localStorage.getItem('company_id');
    dispatch(fetchDepartments({ limit: 100 }));
    dispatch(fetchVehicleRoutes({ limit: 100 }));
    dispatch(fetchPlants({ limit: 100 }));
    if (company_id) dispatch(fetchEmployeeOnboard({ company_id, limit: 2000 }));
  }, [dispatch]);

  const buildApiPayload = () => {
    const { fromDate, toDate, departments, employees, routes, vehicles, plants } = filterData;
    const company_id = localStorage.getItem('company_id');
    const payload = { company_id };

    payload.departments = departments?.length ? JSON.stringify(departments) : undefined;
    payload.employees = employees?.length ? JSON.stringify(employees) : undefined;
    payload.plants = plants?.length ? JSON.stringify(plants) : undefined;
    payload.routes = JSON.stringify(Array.isArray(routes) ? routes : []);
    payload.vehicles = JSON.stringify(Array.isArray(vehicles) ? vehicles : []);

    if (fromDate) payload.from_date = fromDate;
    if (toDate) payload.to_date = toDate;
    return payload;
  };

  useEffect(() => {
    dispatch(fetchEmployeeOnboard({ ...buildApiPayload(), page: page + 1, limit })).then((res) => {
      setFilteredData([].concat(res?.payload?.employes || []));
      setTotalCount(res?.payload?.pagination?.total || res?.payload?.employes?.length || 0);
    });
    // eslint-disable-next-line
  }, [page, limit]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    dispatch(fetchEmployeeOnboard({ ...buildApiPayload(), page: 1, limit })).then((res) => {
      setFilteredData([].concat(res?.payload?.employes || []));
      setTotalCount(res?.payload?.pagination?.total || res?.payload?.employes?.length || 0);
    });
  };

  const handleFormReset = () => {
    const cleared = {
      routes: [],
      vehicles: [],
      fromDate: '',
      toDate: '',
      departments: [],
      employees: [],
      plants: [],
    };
    setFilterData(cleared);
    setPage(0);
    const company_id = localStorage.getItem('company_id');
    dispatch(fetchEmployeeOnboard({ company_id, page: 1, limit })).then((res) => {
      setFilteredData([].concat(res?.payload?.employes || []));
      setTotalCount(res?.payload?.pagination?.total || res?.payload?.employes?.length || 0);
    });
  };

  const handleExport = () =>
    exportToExcel({
      columns,
      rows: buildExportRows({ columns, data: filteredData }),
      fileName: 'employee_onboard_report.xlsx',
    });

  const handleExportPDF = () =>
    exportToPDF({
      columns,
      rows: buildExportRows({ columns, data: filteredData }),
      fileName: 'employee_onboard_report.pdf',
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
        data={filteredData}
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

export default EmployeeOnboard;
