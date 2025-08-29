import { Card, Stack, TextField, FormGroup, FormControlLabel, Checkbox, Button, Divider, TableContainer, Paper, TableHead, Table, TableRow, TableBody, TableCell, tableCellClasses, IconButton, Fab, Tooltip } from "@mui/material";
import SettingsIcon from '@mui/icons-material/Settings';
import { styled } from '@mui/material/styles';
import { useWindowStore } from "./stores/windowStore";
import { useEntry } from "./stores/entryStore";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { unixToDateString } from "./utils";
import { useClient } from "./stores/clientInfoStore";
import usePopups from "./stores/popUpStore";
import AddIcon from '@mui/icons-material/Add';
import GridOnIcon from '@mui/icons-material/GridOn';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));
  
  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));
  
export default function ClientInfo(){
    
    const infoAreaWidth = useWindowStore((state)=> state.infoAreaWidth)
    const infoAreaHeigt = useWindowStore((state)=> state.infoAreaHeight)
    const setRemove = useEntry((state)=> state.setRemoveId)
    const client = useClient((state)=> state.client)
    const entries = useClient((state)=>state.entries)
    const fetchClientSheet = useClient((state)=>state.fetchClientSheet)
    const setShwoNewEntry = usePopups((state) => state.setShowNewEntry)
    const setShowEditClient = usePopups((state)=> state.setShowEditClient)
    const setShowEditEntry = usePopups((state)=> state.setShowEditEntry)

    return(
        <><Card sx={{ width: infoAreaWidth }}>
            <Stack justifyContent="center" alignItems="center" direction="row" spacing={2} sx={{ width: "100%" }}>
                <Stack
                    sx={{
                        flexGrow: 3, // Occupies 2 parts of the total space
                    }}
                >
                    <TextField
                        label="Nimi"
                        value={client.name}
                        size="small"
                        //disabled
                        slotProps={{
                            input: { readOnly: true }
                        }}
                        sx={{
                            mt: 1,
                            ml: 3,
                            mb: 1,
                            mr: 3,
                        }}
                    />
                    <TextField
                        label="Osoite"
                        value={client.address}
                        size="small"
                        //disabled
                        slotProps={{
                            input: { readOnly: true }
                        }}
                        sx={{
                            mt: 1,
                            ml: 3,
                            mb: 1,
                            mr: 3,
                        }}
                    />
                    <Stack direction="row">
                        <TextField
                            label="Sähköposti"
                            value={client.email}
                            size="small"
                            //disabled
                            slotProps={{
                                input: { readOnly: true }
                            }}
                            sx={{
                                mt: 1,
                                ml: 3,
                                mb: 1,
                                mr: 3,
                            }}
                            style={{ width: "80%" }} 
                        />
                        <TextField
                            label="Puhelin"
                            value={client.phone}
                            size="small"
                            //disabled
                            slotProps={{
                                input: { readOnly: true }
                            }}
                            sx={{
                                mt: 1,
                                ml: 3,
                                mb: 1,
                                mr: 3,
                            }}                           
                             style={{ width: "80%" }} 
                        />
                    </Stack>
                </Stack>
                <Stack
                    sx={{
                        flexGrow: 1, // Occupies 2 parts of the total space
                    }}>
                    <TextField
                        label="Asiakasnumero"
                        value={client.formerId}
                        size="small"
                        //disabled
                        slotProps={{
                            input: { readOnly: true }
                        }}
                        sx={{
                            mt: 1,
                            ml: 3,
                            mb: 1,
                            mr: 3,
                        }}                 
                        style={{ width: "30%" }} />
                    <Stack 
                        direction={"row"} 
                        alignItems="center" 
                        spacing={2}
                    >
                        <Stack
                            sx={{ flexGrow: 5, }}
                        >
                            <FormGroup
                                sx={{ mt: 1, ml: 3, mb: 1, mr: 3 }}
                                style={{ width: "80%" }}
                            >
                                <FormControlLabel 
                                    checked={client.supporter} 
                                    control={<Checkbox />} 
                                    label="Kannatusjäsen" 
                                />
                                <FormControlLabel 
                                    checked={client.activeSupporter} 
                                    control={<Checkbox />} 
                                    label="Aktiivinen kannattaja" 
                                />
                            </FormGroup>
                        </Stack>
                        <Stack 
                            sx={{ flexGrow: 3, mt: 1, ml: 3, mb: 1, mr: 3 }} 
                            alignItems="left"
                        >
                            <Button 
                                variant="contained" 
                                sx={{ height: "50%", mt: 1, ml: 1, mb: 1, mr: 4 }} 
                                onClick={()=>setShowEditClient(true)} 
                                startIcon={<SettingsIcon />}
                            >
                                Muokkaa
                            </Button>
                            <Button
                                variant="contained" 
                                sx={{ height: "50%", mt: 1, ml: 1, mb: 1, mr: 4, backgroundColor:  "green" }} 
                                startIcon={<GridOnIcon/>}
                                onClick={()=> fetchClientSheet()}
                            >
                                Tallenna excel
                            </Button>
                        </Stack>
                    </Stack>

                </Stack>

            </Stack>
            <TextField
                label="Lisätietoa"
                value={client.information}
                size="small"
                //disabled
                slotProps={{
                    input: { readOnly: true }
                }}
                sx={{ mt: 1, ml: 3, mb: 1, mr: 3, } }
                style={{ width: "95%" }} />

        </Card>
        <Divider />
    <TableContainer component={Paper}>
      <Table 
        sx={{ width: infoAreaWidth, maxHeight: infoAreaHeigt }} 
        stickyHeader aria-label="customized table"
       >
        <TableHead>
          <TableRow>
            <StyledTableCell 
                align="center"
            >
                    Päivämäärä
            </StyledTableCell>
            <StyledTableCell 
                align="center"
            >
                    Tekstiili&nbsp;(kg) 
            </StyledTableCell>
            <StyledTableCell 
                align="center"
            >
                Materiaali&nbsp;(kg)
            </StyledTableCell>
            <StyledTableCell 
                align="center"
            >   
                Muokkaa
            </StyledTableCell>
            <StyledTableCell 
                align="center"
            >
                Poista
            </StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.map((row) => (
            <StyledTableRow key={row.id}>
                <StyledTableCell 
                    align="center"
                >
                    {unixToDateString(row.date)}
                </StyledTableCell>
                <StyledTableCell 
                    component="th" 
                    align="center"
                >
                    {row.textile.toLocaleString("fi-FI", { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
              </StyledTableCell>
              <StyledTableCell 
                    align="center"
               >
                {row.material.toLocaleString("fi-FI", { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
              </StyledTableCell>
              <StyledTableCell 
                    align="center"
               >
                    <Button 
                        onClick={ () => setShowEditEntry(row.id, true) } 
                        endIcon={<EditIcon/>  }
                    />
              </StyledTableCell>
              <StyledTableCell 
                    align="center"
               >
                <Button 
                    onClick={ () => setRemove(row.id) }  
                    endIcon={<DeleteIcon/>  }
                />
                </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    <Tooltip title="Lisää tapahtuma">
        <Fab
            //sx={{ml: 1, mr: 1, mt: 1, mb:2}} 
            //fullWidth 
            onClick={()=>setShwoNewEntry(true)}
            //startIcon=<Add/>
            color="primary" aria-label="add"
            sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
            }}
        >
            <AddIcon />
        </Fab>
    </Tooltip>
        
        </>
    )

}