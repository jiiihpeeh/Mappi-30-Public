import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import { Box, IconButton, InputAdornment, Stack, TextField } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import usePopups from './stores/popUpStore';
import { useClient } from './stores/clientInfoStore';
import { AllowedEntries,  useEntry } from './stores/entryStore';
import { getLocaleNumberFormat, unixToDateString } from './utils';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { NumericFormat } from 'react-number-format';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { fiFI } from '@mui/x-date-pickers/locales';



const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
})


export default function EditEntry() {
  const setShowEditEntry = usePopups((state)=> state.setShowEditEntry)
  const showEditEntry = usePopups((state)=> state.showEditEntry)
  const client = useClient((state)=> state.client)
  const editEntry = useEntry((state)=> state.editEntry)

  const entryDate = useEntry((state) => state.modifyEntry.date)
  const setModifyEntryValue = useEntry((state) => state.setModifyEntryValue)
  const modifyEntry = useEntry((state)=> state.modifyEntry)
  const fetchModifiedEntry = useEntry((state)=> state.fetchModifiedEntry)

  const {decimal, } = getLocaleNumberFormat("fi-FI")

  return (
      <Dialog
        fullScreen
        open={showEditEntry}
        onClose={()=>setShowEditEntry(-1,false)}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={()=>setShowEditEntry(-1, false)}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Muokkaa tapahtumaa
            </Typography>
          </Toolbar>
        </AppBar>

        <Stack>
        <TextField
            label="Asiakas"
            sx={{ ml: 3, mr:3, mt:2, flex: 1 }}
            disabled
            value={`${client.name} (${(client.formerId)})`}
        />
        <Box 
           sx={{
            border: "1px solid gray",
            borderRadius: 2,
            padding: 2,
            backgroundColor: "lightgray", // Gray background
            color: "gray", // Grayed text
            ml: 5, mr:5, mt:2, flex: 1,
            mb:1,
          }}
        >
          <Stack>
        <Typography width={"100%"} variant="h6" sx={{ margin: 0 }}>
            Alkuperäiset tiedot
        </Typography>
        <Stack direction={"row"}>

          <TextField
           sx={{ ml: 3, mr:3, mt:2, flex: 1 }}
            label="Päivämäärä"
            disabled
            value={editEntry.date != null ? unixToDateString(editEntry.date) : ""}
          >

          </TextField>
        <NumericFormat 
            label="Tekstiili" 
            customInput={TextField} 
            decimalSeparator={decimal} 
            sx={{ ml: 3, mr:3, mt:2, flex: 1 }}
            disabled
            value={editEntry.textile}
            slotProps={{
              input: {
                  endAdornment: (
                      <InputAdornment position="end">kg</InputAdornment>
                  ),
              },
            }}
        />
        <NumericFormat 
            label="Materiaali" 
            customInput={TextField} 
            decimalSeparator={decimal}
            value={editEntry.material}
            disabled
            sx={{ ml: 3, mr:3, mt:2, flex: 1 }}
            slotProps={{
              input: {
                  endAdornment: (
                      <InputAdornment position="end">kg</InputAdornment>
                  ),
              },
            }}
            />
        </Stack>
        </Stack>
        </Box>
        <Stack direction={"row"}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
              label="Päivämäärä" 
              format='DD.MM.YYYY'
              value={dayjs.unix(entryDate)}
              sx={{width:"20%", ml: 3, mr:3, mt:2, flex: 1, alignContent:"center",}}
              localeText={fiFI.components.MuiLocalizationProvider.defaultProps.localeText}
              onChange={(e: Dayjs | null) => {
                if (e) {
                  const formatted = e.format("DD.MM.YYYY 12:mm");
                  setModifyEntryValue(AllowedEntries.date, formatted);
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
            value = {modifyEntry.textile}
            decimalSeparator={decimal} 
            sx={{ ml: 3, mr:3, mt:2, flex: 1 }}
            slotProps={{
              input: {
                  endAdornment: (
                      <InputAdornment position="end">kg</InputAdornment>
                  ),
              },
            }}
            onChange={(e)=> setModifyEntryValue( AllowedEntries.textile, e.target.value)}/>
        <NumericFormat 
            label="Materiaali" 
            customInput={TextField} 
            decimalSeparator={decimal}
            value = {modifyEntry.material}
            sx={{ ml: 3, mr:3, mt:2, flex: 1 }}
            onChange={(e)=> setModifyEntryValue( AllowedEntries.material, e.target.value)}
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
                sx={{ ml: 3, mr:3, mt:2, mb:3, flex: 1, backgroundColor: 'green',  '&:hover': {
                  backgroundColor: 'darkgreen',  }}}
                //startIcon=<SaveIcon/>
                variant="contained"
                onClick={()=>setShowEditEntry(-1,false)}
            >
                Peruuta
            </Button>
            <Button
                sx={{ ml: 3, mr:3, mt:2, mb:3, flex: 1 ,backgroundColor: 'red',  '&:hover': {
                  backgroundColor: 'darkred',  }}}
                startIcon={<SaveIcon/>}
                variant="contained"
                onClick={()=> fetchModifiedEntry()}
            >
                Tallenna
            </Button>
            </Stack>

        </Stack>





      </Dialog>
  );
} 

