import React, { useEffect, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Typography } from '@mui/material';
import usePopups from './stores/popUpStore';
import { useEntry } from './stores/entryStore';


const goodByes : Array<string> =["Näkemiin", "Heippa", "Jäähyväiset", "Hyvästi"]

export default function FormDialog() {


  const [ canDelete, setCanDelete ] = useState(false)

  function loggaa(e: React.ChangeEvent<HTMLInputElement>){
    setCanDelete(e.target.value === goodBye)
  }
  const showDeleteEntry = usePopups((state)=> state.showDeleteEntry)
  const setShowDeleteEntry = usePopups((state)=> state.setShowDeleteEntry)
  const [goodBye, setGoodBye] = useState("")
  const fetchRemoveEntry = useEntry((state)=> state.fetchRemoveEntry)

  useEffect(()=>{
    showDeleteEntry && setGoodBye(goodByes[Math.floor(Math.random() * goodByes.length)])
  },[showDeleteEntry])
  return (
    <div>
      <Dialog open={showDeleteEntry}  aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Poista kohde</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Haluatko varmasti poistaa kohteen?
            <Typography>
                Kirjoita <b>{goodBye}</b>, jotta voit poistaa kohteen ja klikkaa Poista.
            </Typography>
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Varmistus"
            fullWidth
            onChange={loggaa}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowDeleteEntry(false)} 
            color="primary"
            
          >
            Peruuta
          </Button>
          <Button 
              onClick={() => fetchRemoveEntry()} 
              color="primary"
              variant="contained" 
              startIcon={<DeleteIcon/>}
              disabled={!canDelete}
              sx={{ backgroundColor: 'red', '&:hover': { backgroundColor: 'darkred' } }}
              >
            Poista
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
} 
