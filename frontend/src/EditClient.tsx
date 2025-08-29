import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import { Checkbox, FormControlLabel, IconButton, Stack, TextField, Tooltip } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from "@mui/icons-material/Edit";
import usePopups from './stores/popUpStore';
import { ClientEnum, useClient } from './stores/clientInfoStore';
import { NumericFormat } from 'react-number-format';



const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
})


export default function EditClient() {
  const setShowEditClient = usePopups((state)=> state.setShowEditClient)
  const showEditClient = usePopups((state)=> state.showEditClient)
  const editClient = useClient((state)=> state.editClient)
  const updateEditClient = useClient((state)=>state.updateEditClient)
  const fetchUpdatedClient = useClient((state)=> state.fetchUpdatedClient)
  const idInUse = useClient((state)=>state.idInUse)
 
  return (
    <React.Fragment>
      <Dialog
        fullScreen
        open={showEditClient}
        onClose={()=>setShowEditClient(false)}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Muokkkaa asiakastietoja
            </Typography>
          </Toolbar>
        </AppBar>
          <Stack>
          <Stack
                sx={{flexGrow: 3, }}
            >

                    <Stack direction={"row"}>
                      <TextField
                          autoFocus={false}
                          label="Nimi"
                          value={editClient.name}
                          size="small"
                          onChange={(e)=> updateEditClient(ClientEnum.name, e.target.value) }
                          sx={{ mt: 3, ml: 3, mb: 1, mr: 3, flexGrow:5, '& .Mui-disabled': { color: 'text.primary', } }}
                      />
                      <NumericFormat 
                        label="Asiakasnumero" 
                        customInput={TextField}
                        size="small" 
                        sx={{ mt: 3, ml: 3, mb: 1, mr: 3, flexGrow :1, '& .MuiInputBase-input': {
                          } }}
                        value={`${editClient.formerId}`}
                        onChange={(e)=> updateEditClient(ClientEnum.formerId, e.target.value) }
                      />
                    </Stack>

                    <TextField
                        label="Osoite"
                        autoFocus={false}
                        value={editClient.address}
                        onChange={(e)=> updateEditClient(ClientEnum.address, e.target.value) }
                        size="small"
                        sx={{ mt: 1, ml: 3, mb: 1, mr: 3, '& .Mui-disabled': { color: 'text.primary', } }} />

                    <Stack direction="row">
                        <TextField
                            label="Sähköposti"
                            value={editClient.email}
                            onChange={(e)=> updateEditClient(ClientEnum.email, e.target.value) }
                            size="small"
                            sx={{ mt: 1, ml: 3, mb: 1, mr: 3, 
                                '& .Mui-disabled': { color: 'text.primary', } }}
                            style={{ width: "80%" }} />
                        <TextField
                            label="Puhelin"
                            value={editClient.phone}
                            onChange={(e)=> updateEditClient(ClientEnum.phone, e.target.value) }
                            size="small"
                            sx={{ mt: 1, ml: 3, mb: 1, mr: 3, '& .Mui-disabled': { color: 'text.primary', }, }}
                            style={{ width: "80%" }} />
                    </Stack>
                </Stack>
                <Stack
                    sx={{
                        flexGrow: 1, // Occupies 2 parts of the total space
                    }}>

                    <Stack direction={"row"} alignItems="center" spacing={2}>
                        <Stack
                            direction={"row"}
                            sx={{ flexGrow: 5, ml: 5, mr: 5 }}
                        >
                                <FormControlLabel sx={{  ml: 5, mr:1 }} checked={editClient.supporter} control={<Checkbox onChange={()=> updateEditClient(ClientEnum.supporter, !editClient.supporter) } />} label="Kannatusjäsen" />
                                <FormControlLabel sx={{  ml: 1 ,mr: 5 }} checked={editClient.activeSupporter} control={<Checkbox onChange={()=> updateEditClient(ClientEnum.activeSupporter, !editClient.activeSupporter) } />} label="Aktiivinen kannattaja" />
                        </Stack>
                    </Stack>

                </Stack>

            </Stack>
            <TextField
                label="Lisätietoa"
                autoFocus={false}
                value={editClient.information}
                onChange={(e)=> updateEditClient(ClientEnum.information, e.target.value) }
                size="small"
                sx={{ mt: 1, ml: 3, mb: 1, mr: 3,'& .Mui-disabled': { color: 'text.primary', } }}
            />

        <Stack direction={"row"}>
        <Button
            sx={{ ml: 3, mr:3, mt:2, mb:3, flex: 1 }}
            // startIcon=<SaveIcon/>
            variant="contained"
            onClick={() => setShowEditClient(false)}
        >
                Peruuuta
        </Button>
        <Button
            sx={{ ml: 3, mr:3, mt:2, mb:3, flex: 1, backgroundColor: 'red',  '&:hover': {
                backgroundColor: 'darkred', 
              }}}
            startIcon={<SaveIcon/>}
            variant="contained"
            onClick={() => fetchUpdatedClient()}
            disabled={idInUse}
        >
            Tallenna
        </Button>
        </Stack>


      </Dialog>
         </React.Fragment>

  );
} 

