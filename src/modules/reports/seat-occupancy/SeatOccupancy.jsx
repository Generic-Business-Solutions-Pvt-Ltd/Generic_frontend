import moment from 'moment-timezone';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FilterOption from '../../../components/FilterOption';
import ReportTable from '../../../components/table/ReportTable';
import { fetchSeatOccupancyReport } from '../../../redux/vehicleReportSlice';
import { fetchVehicleRoutes } from '../../../redux/vehicleRouteSlice';
import { exportToExcel, exportToPDF, buildExportRows } from '../../../utils/exportUtils';

const columns = [
  { key: 'date', header: 'Date', render: (value) => (value ? moment(value).format('YYYY-MM-DD') : '-') },
  { key: 'vehicleNo', header: 'Vehicle Number', render: (v, row) => row?.vehicleNo || '-' },
  { key: 'routeName', header: 'Route Detail', render: (v, row) => row?.routeName || '-' },
  { key: 'driverName', header: 'Driver Name', render: (v, row) => row?.driverName || '-' },
  { key: 'driverNumber', header: 'Driver Number', render: (v, row) => row?.driverNumber || '-' },
  { key: 'totalSeats', header: 'Total Seats', render: (v, row) => row?.totalSeats ?? '-' },
  { key: 'totalOccupied', header: 'Occupied', render: (v, row) => row?.totalOccupied ?? '-' },
  {
    key: 'totalOccupancyRate',
    header: 'Occupancy Rate',
    render: (v, row) => (typeof row?.totalOccupancyRate === 'number' ? `${row.totalOccupancyRate}%` : '-'),
  },
];

function SeatOccupancy() {
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [filterData, setFilterData] = useState({ vehicles: [], routes: [], fromDate: '', toDate: '' });
  const [filteredData, setFilteredData] = useState([]);

  const company_id = localStorage.getItem('company_id');
  const { seatOccupancyReportData, loading, error } = useSelector((state) => state?.vehicleReport);
  const { routes: vehicleRoutes } = useSelector((state) => state?.vehicleRoute?.vehicleRoutes || {});

  useEffect(() => {
    if (company_id) dispatch(fetchVehicleRoutes({ company_id, limit: 100 }));
  }, [dispatch, company_id]);

  useEffect(() => {
    if (company_id)
      dispatch(fetchSeatOccupancyReport({ company_id, page: page + 1, limit })).then((res) => {
        if (res?.payload?.status === 200) setFilteredData(Array.isArray(res?.payload?.data) ? res.payload.data : []);
      });
  }, [dispatch, company_id, page, limit]);

  const buildApiPayload = () => {
    const payload = { company_id };
    if (filterData.vehicles?.length) payload.vehicles = JSON.stringify(filterData.vehicles);
    if (filterData.routes?.length) payload.routes = JSON.stringify(filterData.routes);
    if (filterData.fromDate) payload.from_date = filterData.fromDate;
    if (filterData.toDate) payload.to_date = filterData.toDate;
    payload.page = page + 1;
    payload.limit = limit;
    return payload;
  };

  const handleExport = () =>
    exportToExcel({
      columns,
      rows: buildExportRows({ columns, data: filteredData }),
      fileName: 'seat_occupancy_report.xlsx',
    });

  const handleExportPDF = () =>
    exportToPDF({
      columns,
      rows: buildExportRows({ columns, data: filteredData }),
      fileName: 'seat_occupancy_report.pdf',
      orientation: 'landscape',
    });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    dispatch(fetchSeatOccupancyReport(buildApiPayload())).then((res) => {
      if (res?.payload?.status === 200) {
        toast.success(res?.payload?.message);
        setFilteredData(Array.isArray(res?.payload?.data) ? res.payload.data : []);
      } else {
        toast.error(res?.payload?.message);
      }
    });
  };

  const handleFormReset = () => {
    setFilterData({ vehicles: [], routes: [], fromDate: '', toDate: '' });
  };

  const tableData = Array.isArray(filteredData)
    ? filteredData.map((item) => {
        const totalAssigned =
          typeof item.totalAssigned === 'number' && item.totalAssigned > 0
            ? item.totalAssigned
            : item.vehicle?.total_seats;
        const totalOccupied = typeof item.totalOccupied === 'number' ? item.totalOccupied : 0;
        return {
          date: item.date ? moment(item.date).format('YYYY-MM-DD') : '-',
          vehicleNo: item.vehicle?.vehicle_number || '-',
          routeName: item.vehicle?.Vehicle_Route?.[0]?.name || '-',
          driverName:
            `${item.vehicle?.vehicle_driver?.first_name || ''} ${
              item.vehicle?.vehicle_driver?.last_name || ''
            }`.trim() || '-',
          driverNumber: item.vehicle?.vehicle_driver?.phone_number || '-',
          totalSeats: item.vehicle?.total_seats ?? '-',
          totalOccupied: typeof item.totalOccupied === 'number' ? item.totalOccupied : '-',
          totalOccupancyRate:
            typeof totalAssigned === 'number' && totalAssigned > 0 && typeof totalOccupied === 'number'
              ? Math.round((totalOccupied / totalAssigned) * 100)
              : 0,
        };
      })
    : [];

  const totalCount = seatOccupancyReportData?.pagination?.total || filteredData.length;

  return (
    <div className='w-full h-full p-2'>
      <h1 className='text-2xl font-bold mb-4 text-[#07163d]'>Seat Occupancy Report</h1>
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

export default SeatOccupancy;
