import { Button,  Paper, styled, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useSummary } from "./stores/summaryStore";
import { sumArray, unixToDateString } from "./utils";
import PersonIcon from '@mui/icons-material/Person3'
import { useWindowStore } from "./stores/windowStore";
import { InfoView, useInfoView } from "./stores/infoViewStore";
import { useClient } from "./stores/clientInfoStore";
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

export function SummaryView(){
    const entries = useSummary((state) => state.summaryData )
    const infoAreaWidth = useWindowStore((state)=> state.infoAreaWidth)
    const setInfoView = useInfoView((state) => state.setInfoView)
    const setClientById = useClient((state)=>state.setClientById)
    const infoAreaHeight = useWindowStore((state)=> state.infoAreaHeight)
    const startDate = useSummary((state)=> state.startDate)
    const endDate = useSummary((state)=> state.endDate)
    const fetchSummarySheet = useSummary((state) => state.fetchSummarySheet)

    return(
        <TableContainer component={Paper} sx={{ maxHeight: infoAreaHeight}}>
        <Table sx={{ width: infoAreaWidth }}stickyHeader aria-label="sticky table" >
          <TableHead>
            <TableRow>
              <StyledTableCell align="center">Päivämäärä </StyledTableCell>
              <StyledTableCell align="center">Asiakas </StyledTableCell>
              <StyledTableCell align="center">Tekstiili&nbsp;(kg) </StyledTableCell>
              <StyledTableCell align="center">Materiaali&nbsp;(kg)</StyledTableCell>
              <StyledTableCell align="center">Näytä asiakaskortti</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((row) => (
              <StyledTableRow key={row.entryId}>
                  <StyledTableCell align="center">{unixToDateString(row.date)}</StyledTableCell>
                  <StyledTableCell align="center">{row.clientName} ({row.clientFormerId})</StyledTableCell>
                <StyledTableCell component="th" align="center">
                  {row.textile.toLocaleString("fi-FI", { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                </StyledTableCell>
                <StyledTableCell align="center">{row.material.toLocaleString("fi-FI", { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</StyledTableCell>
                <StyledTableCell align="center"><Button onClick={ () => {setClientById(row.clientId);setInfoView(InfoView.ClientData)} } endIcon={<PersonIcon/>}  /></StyledTableCell>
              </StyledTableRow>
            ))}
            
                <TableRow>
                <TableCell align="center"><Typography sx={{ fontWeight: 'bold', color: 'green' }}>{unixToDateString(startDate)} - {unixToDateString(endDate)} </Typography></TableCell>
                <TableCell align="center"><Typography sx={{ fontWeight: 'bold', color: 'green' }}>Yhteensä</Typography></TableCell>
                <TableCell align="center"><Typography sx={{ fontWeight: 'bold', color: 'darkblue' }}> {sumArray(entries.map(entry => entry.textile)).toLocaleString("fi-FI", { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</Typography></TableCell>
                <TableCell align="center"><Typography sx={{ fontWeight: 'bold', color: 'darkred' }}>{sumArray(entries.map(entry => entry.material)).toLocaleString("fi-FI", { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</Typography></TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Button
                    variant="contained" 
                    sx={{ height: "50%", mt: 1, ml: 1, mb: 1, mr: 1, backgroundColor:  "green" }} 
                    startIcon={<GridOnIcon/>}
                    fullWidth
                    onClick={() => fetchSummarySheet() }
                  >
                    Tallenna Excel
                  </Button>
                </TableCell>
              </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    )
}