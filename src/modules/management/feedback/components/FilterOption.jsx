import { Accordion, AccordionDetails, AccordionSummary, TextField, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function FilterOption({ filterData, setFilterData, handleClickFilter, handleFormReset, handleExport }) {
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFilterData({
      ...filterData,
      [name]: value,
    });
  };

  return (
    <div className='bg-white rounded-sm border-t-3 border-[#07163d]'>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='panel2-content'>
          <Typography component='span'>Filter option</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div>
              <TextField
                label='From Date'
                type='date'
                InputLabelProps={{ shrink: true }}
                fullWidth
                size='small'
                onChange={handleInputChange}
                name='fromDate'
                value={filterData.fromDate}
              />
            </div>
            <div>
              <TextField
                label='To Date'
                type='date'
                InputLabelProps={{ shrink: true }}
                fullWidth
                size='small'
                onChange={handleInputChange}
                name='toDate'
                value={filterData.toDate}
              />
            </div>
            <div className='flex gap-2.5'>
              <button
                type='submit'
                className='text-white bg-[#07163d] hover:bg-[#07163d] font-medium rounded-sm text-sm px-5 py-2.5 cursor-pointer'
                onClick={handleClickFilter}>
                Filter
              </button>
              <button
                type='button'
                className='text-white bg-gray-500 hover:bg-gray-600 font-medium rounded-sm text-sm px-5 py-2.5 cursor-pointer'
                onClick={handleFormReset}>
                Reset
              </button>
              <button
                type='button'
                className='text-white bg-[#1d31a6] hover:bg-[#1d31a6] font-medium rounded-sm text-sm px-5 py-2.5 cursor-pointer'
                onClick={handleExport}>
                Export
              </button>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

export default FilterOption;
