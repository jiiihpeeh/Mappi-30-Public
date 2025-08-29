import  {  useState, useMemo,  } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid2,
  TextField,
  InputAdornment,
} from "@mui/material";
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import { ClientData, useClient } from "./stores/clientInfoStore";
import { InfoView, useInfoView } from "./stores/infoViewStore";

function filterClients(clients : Array<ClientData>, searchText : string):Array<ClientData> {
    if (searchText.length === 0){
        return clients
    }
    let filtered = clients
    try{
        filtered = clients.filter(client => client.name.toLowerCase().includes(searchText.toLowerCase()))
        return filtered
    }
    catch(err) {
        return clients
    }
}
enum AdditionalInfo{
    address = "address",
    phone = "phone",
    email = "email",
    none = "none"
}

function additionalInformation(d: ClientData): AdditionalInfo{
    if(d.address != ""){
        return AdditionalInfo.address
    } else if (d.phone != ""){
        return AdditionalInfo.phone
    } else if ( d.email != "" ){
        return AdditionalInfo.email
    }
    return AdditionalInfo.none
}

export  function ClientView() {
    const clients = useClient((state)=>state.clients)
    const setClient = useClient((state)=>state.setClient)
    const [searchText, setSearchText ] = useState("")
    const setInfoView = useInfoView((state) => state.setInfoView)
    const filteredClients: Array<ClientData> = useMemo(() => {
        return filterClients(clients, searchText);
      }, [searchText,clients])

    return (
        <Box sx={{ padding: 2 }}>

        <TextField
            label={"Etsi asiakas"}
            slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="end">
                      <PersonSearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
              fullWidth
              sx={{mt:1, mb:3, backgroundColor: "white"}}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value) }
        />
        <Grid2 container spacing={2} justifyContent="center">
            {Array.isArray(filteredClients) && filteredClients.map((client) => (
            <Grid2
                key={client.id}
            >
                <Card 
                    sx={{ boxShadow: 3, borderRadius: 2 }}
                    onClick={()=>{setClient(client); setInfoView(InfoView.ClientData)}}    
                >
                <CardContent>
                    <Typography variant="subtitle2" component="div" gutterBottom>
                    {client.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {client[additionalInformation(client) as keyof ClientData] || ""}
                    </Typography>
                </CardContent>
                </Card>
            </Grid2>
            ))}
        </Grid2>
        </Box>
    );
}
  