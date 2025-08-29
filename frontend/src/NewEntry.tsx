import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import { InputAdornment, Stack, TextField } from '@mui/material';
import { NumericFormat } from 'react-number-format'
import {  getLocaleNumberFormat } from './utils';
import { AllowedEntries, useEntry } from './stores/entryStore';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import updateLocale from 'dayjs/plugin/updateLocale'
import { fiFI } from '@mui/x-date-pickers/locales';
import SaveIcon from '@mui/icons-material/Save';
import usePopups from './stores/popUpStore';
import { useClient } from './stores/clientInfoStore';

dayjs.locale("fi");

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});


export default function FullScreenDialog() {
  dayjs.extend(updateLocale)
  dayjs.updateLocale('fi', {
      weekStart: 1,
  })
  const {decimal, } = getLocaleNumberFormat("fi-FI")
  const setNewEntryValue = useEntry((state) => state.setNewEntryValue)
  const entryDate = useEntry((state)=>state.entryDate)
  const showNewEntry = usePopups((state)=> state.showNewEntry)
  const setShowNewEntry = usePopups((state)=> state.setShowNewEntry)
  const client = useClient((state)=> state.client)
  const fetchNewEntry = useEntry((state)=> state.fetchNewEntry)

  return (
    <React.Fragment>
      <Dialog
        fullScreen
        open={showNewEntry}
        onClose={()=>setShowNewEntry(false)}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={()=>setShowNewEntry(false)}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Uusi tapahtuma
            </Typography>
          </Toolbar>
        </AppBar>
        <Stack>
        <TextField
            label="Asiakas"
            sx={{ ml: 3, mr:3, mt:3, flex: 1 }}
            slotProps={{
              input: { readOnly: true }
            }}
            //disabled
            value={`${client.name} (${client.formerId})`}
        />

        <Stack direction="row">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
              value={entryDate}
              label="Päivämäärä" 
              format='DD.MM.YYYY'
              sx={{width:"20%", ml: 3, mr:3, mt:2, flex: 1, alignContent:"center",}}
              localeText={fiFI.components.MuiLocalizationProvider.defaultProps.localeText}
              onChange={(e: Dayjs | null) => {
                if (e) {
                  const formatted = e.format("DD.MM.YYYY 12:mm");
                  setNewEntryValue(AllowedEntries.date, formatted);
                } else {
                  console.warn("No valid date selected");
                }
              }}
              onError={(error) => {
                if (error) {
                  console.error("DatePicker error:", error);
                }
              }}
          />
        </LocalizationProvider>
        <NumericFormat 
            label="Tekstiili" 
            customInput={TextField} 
            decimalSeparator={decimal} 
            sx={{ ml: 3, mr:3, mt:2, flex: 1 }}
            value = {"0,000"}
            slotProps={{
              input: {
                  endAdornment: (
                      <InputAdornment position="end">kg</InputAdornment>
                  ),
              },
            }}
            onChange={(e)=> setNewEntryValue( AllowedEntries.textile, e.target.value)}/>
        <NumericFormat 
            label="Materiaali" 
            value={"0,000"}
            customInput={TextField} 
            decimalSeparator={decimal}
            sx={{ ml: 3, mr:3, mt:2, flex: 1 }}
            onChange={(e)=> setNewEntryValue( AllowedEntries.material, e.target.value)}
            slotProps={{
              input: {
                  endAdornment: (
                      <InputAdornment position="end">kg</InputAdornment>
                  ),
              },
            }}
          />
        </Stack>
        <Stack direction={"row"}>
          <Button
            onClick={()=>setShowNewEntry(false)}
            variant='contained'
            sx={{ ml: 3, mr:3, mt:2, mb:3, flex: 1  ,backgroundColor: 'green',  '&:hover': {
              backgroundColor: 'darkgreen',  }}}
            >
            Peruuta
          </Button>
          <Button
              sx={{ ml: 3, mr:3, mt:2, mb:3, flex: 1  ,backgroundColor: 'red',  '&:hover': {
                backgroundColor: 'darkred',  }}}
              startIcon={<SaveIcon/>}
              variant="contained"
              onClick={() => fetchNewEntry()}
          >
              Tallenna
          </Button>

        </Stack>
        </Stack>
      </Dialog>
    </React.Fragment>
  );
} 
