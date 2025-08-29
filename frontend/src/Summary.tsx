 
import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import usePopups from './stores/popUpStore';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useSummary } from './stores/summaryStore';
import dayjs, { Dayjs } from 'dayjs';
import { fiFI } from '@mui/x-date-pickers/locales';
import { dateStringToUnix } from './utils';
import { Table, TableBody, TableCell, TableRow } from '@mui/material';
import { InfoView, useInfoView } from './stores/infoViewStore';

export default function Summary() {
  const showSummary = usePopups((state) => state.showSummary)
  const setShowSummary = usePopups((state)=> state.setShowSummary)
  const startDate = useSummary((state)=> state.startDate)
  const setStartDate = useSummary((state)=>state.setStartDate)
  const endDate = useSummary((state)=> state.endDate)
  const setEndDate = useSummary((state)=>state.setEndDate)
  const setInfoView = useInfoView((state) => state.setInfoView)
  const fetchSummaryData = useSummary((state)=> state.fetchSummaryData)

  return (
      <Dialog
        open={showSummary}
        onClose={() => setShowSummary(false)}
        PaperProps={{
          component: 'form',
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
          },
        }}
      >
        <DialogTitle>Yhteenveto</DialogTitle>
        <DialogContent>
          <Table
              sx={{
                '& .MuiTableCell-root': {
                  border: 'none', // Remove all borders for cells
                },
              }}
          >
            <TableBody>
              {/* Start Date Row */}
              <TableRow>
                <TableCell sx={{ width: '20%', fontWeight: 'bold' }}>Alkaen</TableCell>
                <TableCell>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Päivämäärä"
                      format="DD.MM.YYYY"
                      value={dayjs.unix(startDate)}
                      sx={{ width: '100%' }}
                      localeText={fiFI.components.MuiLocalizationProvider.defaultProps.localeText}
                      onChange={(e: Dayjs | null) => {
                        if (e) {
                          setStartDate(dateStringToUnix(e.format('DD.MM.YYYY 00:00')));
                        } else {
                          console.warn('No valid date selected');
                        }
                      }}
                      onError={(error) => {
                        if (error) {
                          console.error('DatePicker error:', error);
                        }
                      }}
                    />
                  </LocalizationProvider>
                </TableCell>
              </TableRow>
              {/* End Date Row */}
              <TableRow>
                <TableCell sx={{ width: '20%', fontWeight: 'bold' }}>Päättyen</TableCell>
                <TableCell>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Päivämäärä"
                      format="DD.MM.YYYY"
                      value={dayjs.unix(endDate)}
                      sx={{ width: '100%' }}
                      localeText={fiFI.components.MuiLocalizationProvider.defaultProps.localeText}
                      onChange={(e: Dayjs | null) => {
                        if (e) {
                          setEndDate(dateStringToUnix(e.format('DD.MM.YYYY 23:59')));
                        } else {
                          console.warn('No valid date selected');
                        }
                      }}
                      onError={(error) => {
                        if (error) {
                          console.error('DatePicker error:', error);
                        }
                      }}
                    />
                  </LocalizationProvider>
                </TableCell>
              </TableRow>

            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button  variant='contained' onClick={() => setShowSummary(false)}>Peruuta</Button>
          <Button  variant='contained' type="submit" onClick={()=> {fetchSummaryData(); setInfoView(InfoView.Summary); setShowSummary(false)}}>Jatka</Button>
        </DialogActions>
      </Dialog>
  );
}