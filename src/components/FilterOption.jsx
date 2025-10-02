import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { TextField, Typography, Checkbox, Chip } from '@mui/material';
import { Accordion, AccordionDetails, AccordionSummary, Autocomplete } from '@mui/material';

function FilterOption({
  filterData,
  setFilterData,
  handleExport,
  handleExportPDF,
  handleSample,
  fileInputRef,
  handleFileUpload,
  handleFormReset,
  handleFormSubmit,
  employees = [],
  vehicles = [],
  routes = [],
  plants = [],
  intervals = [],
  departments = [],
  geofenceTypes = [],
  statuses = [],
  setFile,
  isDate = true,
}) {
  const selectAllOpt = { label: 'Select All', value: 'SELECT_ALL' };
  const getOptions = (arr) => [selectAllOpt, ...arr];

  const getDisplay = (selected, all) => {
    if (!Array.isArray(selected) || !selected.length) return [];
    if (selected.length === all.length) return [selectAllOpt];
    return all.filter((o) => selected.includes(o.value));
  };

  const handleMultiChange = (key, all) => (_, nv) => {
    const isAll = nv.some((o) => o.value === 'SELECT_ALL');
    setFilterData({
      ...filterData,
      [key]: isAll
        ? filterData[key]?.length === all.length
          ? []
          : all.map((o) => o.value)
        : nv.filter((o) => o.value !== 'SELECT_ALL').map((o) => o.value),
    });
  };

  const departmentOptions = departments?.map((d) => ({ label: d.department_name, value: d.id })) || [];
  const employeeOptions =
    employees?.map((e) => ({ label: `${e.first_name || ''} ${e.last_name || ''}`.trim(), value: e.id })) || [];
  const vehicleOptions = vehicles?.map((v) => ({ label: v?.vehicle?.vehicle_number, value: v.vehicle_id })) || [];
  const routeOptions = routes?.map((r) => ({ label: r.name, value: r.id })) || [];
  const plantOptions = plants?.map((p) => ({ label: p.label || p.name || p.plant_name, value: p.id })) || [];

  const MultiSelect = ({ label, options, value, onChange }) => (
    <Autocomplete
      multiple
      disablePortal
      options={getOptions(options)}
      size='small'
      fullWidth
      disableCloseOnSelect
      renderInput={(params) => <TextField {...params} label={label} />}
      isOptionEqualToValue={(o, v) => o.value === v.value}
      getOptionLabel={(o) => o.label}
      onChange={onChange}
      value={getDisplay(value, options)}
      renderOption={(props, option) => (
        <li {...props} key={option.value}>
          <Checkbox
            style={{ marginRight: 8 }}
            checked={
              option.value === 'SELECT_ALL'
                ? Array.isArray(value) && value.length === options.length
                : Array.isArray(value) && value.includes(option.value)
            }
          />
          {option.label}
        </li>
      )}
      renderTags={(value, getTagProps) =>
        value.length > 3
          ? [
              ...value.slice(0, 2).map((o, i) => <Chip key={o.value} label={o.label} {...getTagProps({ index: i })} />),
              <Chip key='more' label={`+${value.length - 2} more`} {...getTagProps({ index: 2 })} />,
            ]
          : value.map((o, i) => <Chip key={o.value} label={o.label} {...getTagProps({ index: i })} />)
      }
    />
  );

  const SingleSelect = ({ label, options, value, onChange }) => (
    <Autocomplete
      disablePortal
      options={options}
      size='small'
      fullWidth
      renderInput={(params) => <TextField {...params} label={label} />}
      isOptionEqualToValue={(o, v) => o.value === v}
      getOptionLabel={(o) => o.label}
      onChange={(_, nv) => onChange(nv ? nv.value : '')}
      value={options.find((o) => o.value === value) || null}
    />
  );

  return (
    <div className='bg-white rounded-sm border-t-3 border-[#07163d]'>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='panel2-content'>
          <Typography component='span'>Filter option</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            {employees.length > 0 && (
              <SingleSelect
                label='Select Employee'
                options={employeeOptions}
                value={filterData.employee || ''}
                onChange={(v) => setFilterData({ ...filterData, employee: v })}
              />
            )}
            {plants.length > 0 && (
              <SingleSelect
                label='Select Plant'
                options={plantOptions}
                value={filterData.plant || ''}
                onChange={(v) => setFilterData({ ...filterData, plant: v })}
              />
            )}
            {vehicles.length > 0 && (
              <MultiSelect
                label='Select Vehicle Numbers'
                options={vehicleOptions}
                value={filterData.vehicles || []}
                onChange={handleMultiChange('vehicles', vehicleOptions)}
                selectedLen={Array.isArray(filterData.vehicles) ? filterData.vehicles.length : 0}
              />
            )}
            {routes.length > 0 && (
              <MultiSelect
                label='Select Vehicle Routes'
                options={routeOptions}
                value={filterData.routes || []}
                onChange={handleMultiChange('routes', routeOptions)}
                selectedLen={Array.isArray(filterData.routes) ? filterData.routes.length : 0}
              />
            )}
            {departments.length > 0 && (
              <SingleSelect
                label='Select Department'
                options={departmentOptions}
                value={filterData.department || ''}
                onChange={(v) => setFilterData({ ...filterData, department: v })}
              />
            )}
            {intervals.length > 0 && (
              <SingleSelect
                label='Select Interval'
                options={intervals}
                value={filterData.interval}
                onChange={(v) => setFilterData({ ...filterData, interval: v })}
              />
            )}
            {geofenceTypes.length > 0 && (
              <SingleSelect
                label='Select Geofence Type'
                options={geofenceTypes}
                value={filterData.geofenceType}
                onChange={(v) => setFilterData({ ...filterData, geofenceType: v })}
              />
            )}
            {statuses.length > 0 && (
              <SingleSelect
                label='Select Status'
                options={statuses}
                value={filterData.status || ''}
                onChange={(v) => setFilterData({ ...filterData, status: v })}
              />
            )}
            {typeof handleFormSubmit === 'function' && isDate && (
              <>
                <TextField
                  label='From Date'
                  type='datetime-local'
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size='small'
                  name='fromDate'
                  value={filterData.fromDate}
                  onChange={(e) => setFilterData({ ...filterData, fromDate: e.target.value })}
                />
                <TextField
                  label='To Date'
                  type='datetime-local'
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size='small'
                  name='toDate'
                  value={filterData.toDate}
                  onChange={(e) => setFilterData({ ...filterData, toDate: e.target.value })}
                />
              </>
            )}
            {typeof handleFormReset === 'function' && typeof handleFormSubmit === 'function' && (
              <div className='flex gap-2.5'>
                <button
                  type='submit'
                  className='text-white bg-[#07163d] hover:bg-[rgb(7,22,61)] font-medium rounded-sm text-sm w-40 px-5 py-2.5 cursor-pointer'
                  onClick={handleFormSubmit}>
                  Filter
                </button>
                <button
                  type='button'
                  className='text-white bg-gray-500 hover:bg-gray-600 font-medium rounded-sm text-sm w-40 px-5 py-2.5 cursor-pointer'
                  onClick={handleFormReset}>
                  Reset
                </button>
              </div>
            )}
            {typeof handleExport === 'function' && typeof handleExportPDF === 'function' && (
              <div className='flex gap-2.5'>
                <button
                  type='button'
                  className='text-white bg-[#1d31a6] hover:bg-[#1d31a6] font-medium rounded-sm text-sm w-40 px-5 py-2.5 cursor-pointer'
                  onClick={handleExport}>
                  Export Excel
                </button>
                <button
                  type='button'
                  className='text-white bg-red-600 hover:bg-red-700 font-medium rounded-sm text-sm w-40 px-5 py-2.5 cursor-pointer'
                  onClick={handleExportPDF}>
                  Export PDF
                </button>
              </div>
            )}
            {typeof handleFileUpload === 'function' && (
              <TextField
                label='Import File Here'
                type='file'
                fullWidth
                InputLabelProps={{ shrink: true }}
                size='small'
                name='importFile'
                inputRef={fileInputRef}
                required
                onChange={(e) => setFile && setFile(e.target.files[0])}
              />
            )}
            {typeof handleFileUpload === 'function' && typeof handleSample === 'function' && (
              <div className='flex gap-2'>
                <button
                  type='button'
                  className='w-40 text-white bg-gray-500 hover:bg-gray-600 font-medium rounded-sm text-sm px-5 py-1.5 cursor-pointer'
                  onClick={handleFileUpload}>
                  Import
                </button>
                <button
                  type='button'
                  className='w-40 text-white bg-[#07163d] hover:bg-[#07163d] font-medium rounded-sm text-sm px-5 py-1.5 cursor-pointer'
                  onClick={handleSample}>
                  Sample Excel
                </button>
              </div>
            )}
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

export default FilterOption;
