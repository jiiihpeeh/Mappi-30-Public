import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DownloadIcon from '@mui/icons-material/Download';
import ClientInfo from './ClientInfo'
import { useWindowStore } from './stores/windowStore';
import FormDialog from './DeleteEntry';
import NewEntry from './NewEntry';
import EditClient from './EditClient';
import SummarizeIcon from '@mui/icons-material/Summarize'
import usePopups from './stores/popUpStore';
import NewClient from './NewClient'
import FaceIcon from '@mui/icons-material/Face'
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditEntry from './EditEntry';
import NewOldClient from './NewOldClient';
import { ClientView } from './ClientView';
import { InfoView, useInfoView } from './stores/infoViewStore';
import Summary from './Summary';
import { SummaryView } from './SummaryView';
import { useClient } from './stores/clientInfoStore';
import { useEffect, useState } from 'react';
//import { useNotification } from './stores/notificationStore';
import { Snackbar } from '@mui/material';
import { getBackup, restoreBackup } from './api';
import LogIn from './LogIn';
import LogoutIcon from '@mui/icons-material/Logout';
import { useLogIn } from './stores/logInStore';
import GetBackup from './BackupDialog';
import Restore from './Restore';
import { SetAppSize } from '../wailsjs/go/main/App';



function App() {
  const drawerWidth = useWindowStore((state)=>state.sideDrawerWidth)
  const setShowNewClient = usePopups((state)=> state.setShowNewClient)
  const setShowNewOldClient = usePopups((state)=> state.setShowNewOldClient)
  const infoView = useInfoView((state) => state.infoView)
  const setInfoView = useInfoView((state) => state.setInfoView)
  const setShowSummary = usePopups((state) => state.setShowSummary)
  const fetchClients = useClient((state) => state.fetchClients)
  const logOut = useLogIn((state) => state.logOut)
  const setShowGetBackUp = usePopups((state)=> state.setShowGetBackup)
  const setShowRestore = usePopups((state)=> state.setShowRestore)

  useEffect(()=>{
    SetAppSize(window.screen.width,window.screen.height)
  },[])


  return (
    <Box sx={{ display: "flex", height: "100vh" }} color={'greenyellow'}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
      >
        <Toolbar >
          <Typography variant="h6" noWrap component="div">
            Tiedot
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar />
        <Divider />
        <List>
            <ListItem disablePadding>
              <ListItemButton 
                onClick={()=> {setInfoView(InfoView.Clients); fetchClients()}}
                disabled={infoView === InfoView.LogIn}
              >
                <ListItemIcon>
                   <FaceIcon />
                </ListItemIcon>
                <ListItemText primary={"Asiakkaat"} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                disabled={infoView === InfoView.LogIn}
              >
                <ListItemIcon>
                   <PersonAddIcon />
                </ListItemIcon>
                <ListItemText primary={"Lisää asiakas"} onClick={() => setShowNewClient(true)}/>
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                disabled={infoView === InfoView.LogIn}
              >
                <ListItemIcon>
                   <PersonAddIcon />
                </ListItemIcon>
                <ListItemText primary={"Lisää vanha asiakas"} onClick={() => setShowNewOldClient(true)}/>
              </ListItemButton>
            </ListItem>
        </List>
        <Divider />
        <List>
            <ListItem disablePadding>
              <ListItemButton 
                onClick={()=> setShowSummary(true)}
                disabled={infoView === InfoView.LogIn}
              >
                <ListItemIcon>
                   <SummarizeIcon />
                </ListItemIcon>
                <ListItemText primary={"Yhteenveto"} />
              </ListItemButton>
            </ListItem>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton 
                onClick={() => setShowGetBackUp(true)}
                disabled={infoView === InfoView.LogIn}
                >
                <ListItemIcon>
                   <DownloadIcon />
                </ListItemIcon>
                <ListItemText primary={"Tallenna tietokanta"} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                disabled={infoView === InfoView.LogIn}
                onClick={() => setShowRestore(true)}
              >
                <ListItemIcon>
                   <DownloadIcon />
                </ListItemIcon>
                <ListItemText primary={"Palauta tietokanta"} />
              </ListItemButton>
            </ListItem>
            <Divider/>
            <ListItem disablePadding>
              <ListItemButton
                disabled={infoView === InfoView.LogIn}
                onClick={()=>logOut()}
              >
                <ListItemIcon>
                   <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary={"Kirjaudu ulos"} />
              </ListItemButton>
            </ListItem>
        </List>
        
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3}}
      >
        <Toolbar />
        {infoView === InfoView.LogIn ? <LogIn/>:<></> }
        {infoView === InfoView.Clients ? <ClientView/>:<></> }
        {infoView === InfoView.ClientData ? <ClientInfo/>:<></> }
        {infoView === InfoView.Summary ? <SummaryView/>:<></> }
        
      </Box>
      <FormDialog/> 
      <NewEntry/>
      <EditClient/>
      <NewClient/>
      <EditEntry/>
      <NewOldClient/>
      <Summary/>
      <GetBackup/>
      <Restore/>
      {/* <Snackbar
        // anchorOrigin={{ vertical, horizontal }}
        open={snackSwitch}
        onClose={()=>setSnackSwitch(false)}
        message={message}
        //key={vertical + horizontal}
        autoHideDuration={1200}
      /> */}
    </Box>
  )
}


export default App
