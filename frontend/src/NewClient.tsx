import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import { Checkbox, FormControlLabel, Stack, TextField } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

import usePopups from './stores/popUpStore';
import { ClientEnum, useClient } from './stores/clientInfoStore';



const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
})


export default function NewClient() {
  const setShowNewClient = usePopups((state)=> state.setShowNewClient)
  const showNewClient = usePopups((state)=> state.showNewClient)
  const newClient = useClient((state)=> state.newClient)
  const setNewClient = useClient((state)=>state.setNewClient)
  const fetchNewClient = useClient((state)=> state.fetchNewClient)
 
  return (
    <React.Fragment>
      <Dialog
        fullScreen
        open={showNewClient}
        onClose={()=>setShowNewClient(false)}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Lisää asiakas
            </Typography>
          </Toolbar>
        </AppBar>
          <Stack>
          <Stack
                sx={{flexGrow: 3, }}
            >
                    <TextField
                        label="Nimi"
                        value={newClient.name}
                        size="small"
                        onChange={(e)=> setNewClient(ClientEnum.name, e.target.value) }
                        sx={{ mt: 2, ml: 3, mb: 1, mr: 3, '& .Mui-disabled': { color: 'text.primary', } }} />
                    <TextField
                        label="Osoite"
                        value={newClient.address}
                        onChange={(e)=> setNewClient(ClientEnum.address, e.target.value) }
                        size="small"
                        sx={{ mt: 1, ml: 3, mb: 1, mr: 3, '& .Mui-disabled': { color: 'text.primary', } }} />

                    <Stack direction="row">
                        <TextField
                            label="Sähköposti"
                            value={newClient.email}
                            onChange={(e)=> setNewClient(ClientEnum.email, e.target.value) }
                            size="small"
                            sx={{ mt: 1, ml: 3, mb: 1, mr: 3, 
                                '& .Mui-disabled': { color: 'text.primary', } }}
                            style={{ width: "80%" }} />
                        <TextField
                            label="Puhelin"
                            value={newClient.phone}
                            onChange={(e)=> setNewClient(ClientEnum.phone, e.target.value) }
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
                                <FormControlLabel sx={{  ml: 5, mr:1 }} checked={newClient.supporter} control={<Checkbox onChange={()=> setNewClient(ClientEnum.supporter, !newClient.supporter) } />} label="Kannatusjäsen" />
                                <FormControlLabel sx={{  ml: 1 ,mr: 5 }} checked={newClient.activeSupporter} control={<Checkbox onChange={()=> setNewClient(ClientEnum.activeSupporter, !newClient.activeSupporter) } />} label="Aktiivinen kannattaja" />
                        </Stack>
                    </Stack>

                </Stack>

            </Stack>
            <TextField
                label="Lisätietoa"
                autoFocus={false}
                value={newClient.information}
                onChange={(e)=> setNewClient(ClientEnum.information, e.target.value) }
                size="small"
                sx={{ mt: 1, ml: 3, mb: 1, mr: 3,'& .Mui-disabled': { color: 'text.primary', } }}
            />

        <Stack direction={"row"}>
        <Button
            sx={{ ml: 3, mr:3, mt:2, mb:3, flex: 1 }}
            // startIcon=<SaveIcon/>
            variant="contained"
            onClick={() => setShowNewClient(false)}
        >
                Peruuuta
        </Button>
        <Button
            sx={{ ml: 3, mr:3, mt:2, mb:3, flex: 1, backgroundColor: 'red',  '&:hover': {
                backgroundColor: 'darkred', 
              }}}
            startIcon={<SaveIcon/>}
            variant="contained"
            disabled={newClient.name.length === 0}
            onClick={()=>fetchNewClient()}
        >
            Tallenna
        </Button>
        </Stack>


      </Dialog>
         </React.Fragment>

  );
} 

