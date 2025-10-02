import { Table, TableBody, TableCell, TableContainer } from '@mui/material';
import { TableHead, TablePagination, TableRow, TableSortLabel } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ApiService } from '../../services';
import { APIURL } from '../../constants';

const columns = [
  { key: 'firstName', header: 'First Name' },
  { key: 'lastName', header: 'Last Name' },
  { key: 'punchId', header: 'Punch ID' },
  { key: 'punchTime', header: 'Punch Time' },
];

export default function EmployeePunchDetails() {
  const { state } = useLocation();
  const selectedVehicle = state?.selectedVehicle;
  const companyId = localStorage.getItem('company_id');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');
  const [data, setData] = useState([]);
  const [vehicleInfo, setVehicleInfo] = useState({});

  useEffect(() => {
    if (!selectedVehicle) return;
    (async () => {
      const res = await ApiService.get(APIURL.PUNCHINMULTITRACK, {
        company_id: companyId,
        vehicle_name: selectedVehicle.vehicle_name,
      });
      if (res.success) {
        setData(
          (res.data.employees || []).map((item, idx) => ({
            id: idx + 1,
            firstName: item.first_name,
            lastName: item.last_name,
            punchId: item.punch_id,
            punchTime: item.punch_time
              ? new Date(item.punch_time).toLocaleString()
              : item.mssg || 'Punch data not available',
          }))
        );
        setVehicleInfo({
          name: selectedVehicle.vehicle_name || '-',
          number: selectedVehicle.vehicle_number || '-',
          speed: selectedVehicle.speed ?? '-',
          onboarded: res.data.employees?.length ?? 0,
        });
      }
    })();
  }, [selectedVehicle, companyId]);

  const handleSort = (key) => {
    setOrderBy(key);
    setOrder(orderBy === key && order === 'asc' ? 'desc' : 'asc');
  };

  const sorted = orderBy
    ? [...data].sort((a, b) => {
        const va = a[orderBy],
          vb = b[orderBy];
        if (typeof va === 'string') return order === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
        return order === 'asc' ? va - vb : vb - va;
      })
    : data;

  const paginated = sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleExport = () => {
    // Implement export logic here
  };

  return (
    <div className='w-full h-full p-2'>
      <div className='bg-white rounded-sm border-t-3 border-[#07163d] mt-4'>
        <div className='p-4'>
          <h3 className='text-2xl font-bold mb-4 text-[#07163d]'>Vehicle Details</h3>
          <ul className='list-disc list-inside'>
            <li>Vehicle Name: {vehicleInfo.name}</li>
            <li>Vehicle Number: {vehicleInfo.number}</li>
            <li>Speed: {vehicleInfo.speed}</li>
            <li>Total Onboarded Employee: {vehicleInfo.onboarded}</li>
          </ul>
        </div>
        <div className='flex justify-between items-center p-4'>
          <h2 className='text-2xl font-bold mb-4 text-[#07163d]'>Employee Punch Details</h2>
          <button
            type='button'
            className='text-white bg-[#1d31a6] hover:bg-[#1d31a6] font-medium rounded-sm text-sm px-5 py-2.5 cursor-pointer'
            onClick={handleExport}>
            Export
          </button>
        </div>
        <TableContainer sx={{ maxHeight: 400, overflowX: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell key={col.key} align='left' sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    <TableSortLabel
                      active={orderBy === col.key}
                      direction={orderBy === col.key ? order : 'asc'}
                      onClick={() => handleSort(col.key)}>
                      {col.header}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((col) => (
                    <TableCell className='whitespace-nowrap' key={col.key}>
                      {row[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 15, 20, 25, 30]}
          component='div'
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </div>
    </div>
  );
}
