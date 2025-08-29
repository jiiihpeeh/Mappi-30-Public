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
import { NumericFormat } from 'react-number-format';



const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="down" ref={ref} {...props} />;
})


export default function NewOldClient() {
  const setShowNewOldClient = usePopups((state)=> state.setShowNewOldClient)
  const showNewOldClient = usePopups((state)=> state.showNewOldClient)

  const newOldClient = useClient((state)=> state.newOldClient)
  const setNewOldClient = useClient((state)=>state.setNewOldClient)
  const fetchOldNewClient = useClient((state)=>state.fetchOldNewClient)
  const idInUse = useClient((state) => state.idInUse)
  const [ numberColor, setNumberColor ] = React.useState("red")

  React.useEffect(() => {
    if (newOldClient.formerId > 29999 || newOldClient.formerId < 10000 ) {
      setNumberColor("red")
    }else{
      setNumberColor("black")
    }
  },[newOldClient.formerId])
 
  return (
      <Dialog
        fullScreen
        open={showNewOldClient}
        onClose={()=>setShowNewOldClient(false)}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <Typography 
                sx={{ ml: 2, flex: 1 }} 
                variant="h6" 
                component="div"
            >
              Lisää vanha asiakas
            </Typography>
          </Toolbar>
        </AppBar>
          <Stack>
          <Stack
                sx={{flexGrow: 3, }}
            >
                  <Stack direction="row">
                  <TextField
                        label="Nimi"
                        value={newOldClient.name}
                        size="small"
                        onChange={(e)=> setNewOldClient(ClientEnum.name, e.target.value) }
                        sx={{  mt: 3, ml: 3, mb: 1, mr: 3, flexGrow :5, '& .Mui-disabled': { color: 'text.primary', }, }} />
                    <NumericFormat 
                        label="Asiakasnumero" 
                        customInput={TextField}
                        size="small" 
                        sx={{ mt: 3, ml: 3, mb: 1, mr: 3, flexGrow :1, '& .MuiInputBase-input': {
                          color: numberColor , } }}
                        value={`${newOldClient.formerId}`}
                        onChange={(e)=> setNewOldClient(ClientEnum.formerId, e.target.value) }
                    />
                    </Stack>
                    <TextField
                        label="Osoite"
                        value={newOldClient.address}
                        onChange={(e)=> setNewOldClient(ClientEnum.address, e.target.value) }
                        size="small"
                        sx={{ mt: 1, ml: 3, mb: 1, mr: 3, '& .Mui-disabled': { color: 'text.primary', } }} />
                    <Stack direction="row">
                        <TextField
                            label="Sähköposti"
                            value={newOldClient.email}
                            onChange={(e)=> setNewOldClient(ClientEnum.email, e.target.value) }
                            size="small"
                            sx={{ mt: 1, ml: 3, mb: 1, mr: 3, 
                                '& .Mui-disabled': { color: 'text.primary', } }}
                            style={{ width: "80%" }} />
                        <TextField
                            label="Puhelin"
                            value={newOldClient.phone}
                            onChange={(e)=> setNewOldClient(ClientEnum.phone, e.target.value) }
                            size="small"
                            sx={{ mt: 1, ml: 3, mb: 1, mr: 3, '& .Mui-disabled': { color: 'text.primary', }, }}
                            style={{ width: "80%" }} />
                    </Stack>
                </Stack>
                <Stack
                    sx={{
                        flexGrow: 1, 
                    }}>

                    <Stack
                      direction={"row"} 
                      alignItems="center" 
                      spacing={2}
                    >
                        <Stack
                            direction={"row"}
                            sx={{ flexGrow: 5, ml: 5, mr: 5 }}
                        >
                                <FormControlLabel 
                                  sx={{  ml: 5, mr:1 }}
                                  checked={newOldClient.supporter} 
                                  control={<Checkbox onChange={()=> setNewOldClient(ClientEnum.supporter, !newOldClient.supporter) } />} 
                                  label="Kannatusjäsen" 
                                />
                                <FormControlLabel 
                                  sx={{  ml: 1 ,mr: 5 }} 
                                  checked={newOldClient.activeSupporter} control={<Checkbox onChange={()=> setNewOldClient(ClientEnum.activeSupporter, !newOldClient.activeSupporter) } />} 
                                  label="Aktiivinen kannattaja" 
                                />
                        </Stack>
                    </Stack>
                </Stack>
            </Stack>
            <TextField
                label="Lisätietoa"
                autoFocus={false}
                value={newOldClient.information}
                onChange={(e)=> setNewOldClient(ClientEnum.information, e.target.value) }
                size="small"
                sx={{ mt: 1, ml: 3, mb: 1, mr: 3,'& .Mui-disabled': { color: 'text.primary', } }}
            />

        <Stack direction={"row"}>
        <Button
            sx={{ ml: 3, mr:3, mt:2, mb:3, flex: 1 }}
            // startIcon=<SaveIcon/>
            variant="contained"
            onClick={() => setShowNewOldClient(false)}
        >
                Peruuuta
        </Button>
        <Button
            sx={{ ml: 3, mr:3, mt:2, mb:3, flex: 1, backgroundColor: 'red',  '&:hover': {
                backgroundColor: 'darkred', 
              }}}
            startIcon={<SaveIcon/>}
            variant="contained"
            disabled={(numberColor === "red") || (newOldClient.name.length === 0)|| idInUse}
            onClick={()=>fetchOldNewClient()}
        >
            Tallenna
        </Button>
        </Stack>
      </Dialog>

  );
} 

