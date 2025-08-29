import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import usePopups from './stores/popUpStore';
import { CheckPassword } from '../wailsjs/go/main/App';
import { Checkbox, FormControlLabel, Typography } from '@mui/material';
import { useRestore } from './stores/restoreStore';

export default function Restore() {

  const showRestore = usePopups((state)=> state.showRestore)
  const setShowRestore = usePopups((state)=> state.setShowRestore)
  const validate = useRestore((state) => state.validate)
  const validationPassword = useRestore((state) => state.validationPassword)
  const setValidationPassword = useRestore((state)=>state.setValidationPassword)
  const validated = useRestore((state) => state.validated)
  const setEncryptionPassword = useRestore((state) => state.setEncryptionPassword)
  const encryptionPassword = useRestore((state) => state.encryptionPassword)
  const encryption = useRestore((state)=> state.encryption)
  const setEncryption = useRestore((state) => state.setEncryption)
  const runRestore = useRestore((state) => state.runRestore )
  const resetState = useRestore((state) => state.resetState)

  

  return (
      <Dialog
        open={showRestore}
        onClose={()=> setShowRestore(false)}
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
          <Button variant='contained' onClick={()=> {setShowRestore(false); resetState()}} >Peruuta</Button>
          <Button variant='contained' onClick={() => validate()} >Jatka</Button>
        </DialogActions> </>) : (<></>) } 
        { validated ?  (<>

        <DialogTitle>Avaa salasanalla</DialogTitle>

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
            value={encryptionPassword}
            onChange={(e)=>setEncryptionPassword( e.target.value)}
          />

        </DialogContent>
        <DialogActions>
          <Button 
            variant='contained' 
            onClick={()=> {setShowRestore(false); resetState()}} 
          >
            Peruuta
        </Button>
          <Button 
            variant='contained' 
            onClick={() => runRestore()} 
            >
                Jatka
            </Button>
        </DialogActions> </>) : (<></>) } 
      </Dialog>
  );
}