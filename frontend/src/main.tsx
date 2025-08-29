import React from 'react'
import {createRoot} from 'react-dom/client'
import './style.css'
import App from './App'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/fi'; // Import Finnish locale
import { CssBaseline } from '@mui/material';
import { fiFI as coreFiFI } from '@mui/material/locale';
import { fiFI } from '@mui/x-date-pickers/locales';
const container = document.getElementById('root')

const root = createRoot(container!)
dayjs.locale('fi');

const theme = createTheme(
    {
      palette: {
        primary: { main: '#1976d2' },
      },
    },
    fiFI, // x-date-pickers translations
    coreFiFI, // core translations
  );

root.render(
    <React.StrictMode>
        <LocalizationProvider dateAdapter={AdapterDayjs} >
        <ThemeProvider theme={theme}>
        <CssBaseline />
            <App/>
        </ThemeProvider>
        </LocalizationProvider>
    </React.StrictMode>
)
