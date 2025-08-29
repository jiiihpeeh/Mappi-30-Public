import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import usePopups from './stores/popUpStore';
import { CheckPassword } from '../wailsjs/go/main/App';
import { EncryptionPasswordEnum, useBackup } from './stores/backupStore';
import { Checkbox, FormControlLabel } from '@mui/material';

async  function checkPassword(password:string){
    let resp = await CheckPassword(password)
}

export default function GetBackup() {

  const showGetBackUp = usePopups((state)=> state.showGetBackUp)
  const setShowGetBackUp = usePopups((state)=> state.setShowGetBackup)
  const validate = useBackup((state) => state.validate)
  const validationPassword = useBackup((state) => state.validationPassword)
  const setValidationPassword = useBackup((state)=>state.setValidationPassword)
  const validated = useBackup((state) => state.validated)
  const setEncryptionPassword = useBackup((state) => state.setEncryptionPassword)
  const encryptionPassword = useBackup((state) => state.encryptionPassword)
  const encryption = useBackup((state)=> state.encryption)
  const setEncryption = useBackup((state) => state.setEncryption)
  const generateBackup = useBackup((state) => state.generateBackup )
  const resetState = useBackup((state) => state.resetState)

  return (
      <Dialog
        open={showGetBackUp}
        onClose={()=> setShowGetBackUp(false)}
        PaperProps={{
          component: 'form',
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault()
          },
        }}
      >
        { !validated ?  (<>
        <DialogTitle>Anna salasana</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="email"
            label="Salasana"
            type="password"
            fullWidth
            variant="standard"
            value={validationPassword}
            onChange={(e)=>setValidationPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button variant='contained' onClick={()=> {setShowGetBackUp(false); resetState()}} >Peruuta</Button>
          <Button variant='contained' onClick={() => validate()} >Jatka</Button>
        </DialogActions> </>) : (<></>) } 
        { validated ?  (<>

        <DialogTitle>Suojaa salasanalla</DialogTitle>

        <DialogContent>
        <FormControlLabel
          value="end"
          control={<Checkbox checked={encryption} onChange={() => setEncryption(!encryption)} />}
          label="Käytä salasanaa"
          labelPlacement="end"
        />
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="email"
            label="Salasana"
            type="password"
            disabled={!encryption}
            fullWidth
            variant="standard"
            value={encryptionPassword.password}
            onChange={(e)=>setEncryptionPassword(EncryptionPasswordEnum.Password, e.target.value)}
          />
        <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="email"
            label="Vahvista salasana"
            type="password"
            fullWidth
            variant="standard"
            disabled={!encryption}
            value={encryptionPassword.check}
            onChange={(e)=>setEncryptionPassword(EncryptionPasswordEnum.Check, e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button variant='contained' onClick={()=> {setShowGetBackUp(false); resetState()}} >Peruuta</Button>
          <Button 
            variant='contained' 
            disabled={!(encryptionPassword.check === encryptionPassword.password) }
            onClick={() => generateBackup()} 
            >
                Jatka
            </Button>
        </DialogActions> </>) : (<></>) } 
      </Dialog>
  );
}