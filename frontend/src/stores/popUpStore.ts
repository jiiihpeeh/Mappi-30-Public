import { create } from 'zustand';
import { nullEntry, useEntry } from './entryStore';
import { Entry, nullClient, useClient } from './clientInfoStore';
import dayjs  from 'dayjs';
import { getEndOfDay, getMondayOfCurrentWeek } from '../utils';
import { useSummary } from './summaryStore';

type Popup = {
    showDeleteEntry: boolean;
    setShowDeleteEntry: (s: boolean) => void;
    showNewEntry: boolean;
    setShowNewEntry: (to: boolean) => void;
    showEditClient: boolean;
    setShowEditClient: (to: boolean) => void;
    showEditEntry: boolean,
    setShowEditEntry: (id: number, to: boolean) => void,
    showNewClient: boolean,
    setShowNewClient: (to:boolean) => void,
    showNewOldClient: boolean,
    setShowNewOldClient: (to:boolean) => void,
    showSummary : boolean,
    setShowSummary: (to:boolean) => void,
    showGetBackUp: boolean,
    setShowGetBackup: (to:boolean) => void,
    showRestore: boolean,
    setShowRestore: (to:boolean) => void,
};

const usePopups = create<Popup>((set) => ({
    // State and actions for the "Delete Entry" popup
    showDeleteEntry: false,
    setShowDeleteEntry: (show: boolean) => {
        set({ showDeleteEntry: show });
        if (!show) {
            useEntry.setState({ removeId: -1 }); // Reset `removeId` when popup closes
        }
    },

    // State and actions for the "New Entry" popup
    showNewEntry: false,
    setShowNewEntry: (show: boolean) => {
        useEntry.setState({ entryDate: dayjs()})
        if (show) {
            // Initialize `newEntry` with the current client ID when the popup opens
            const currentClientId = useClient.getState().client.id;
            useEntry.setState((state) => ({
                newEntry: { ...state.newEntry, clientId: currentClientId },
            }));
        } else {
            // Reset `newEntry` when the popup closes
            useEntry.setState({ newEntry: nullEntry });
        }
        set({ showNewEntry: show });
    },

    // State and actions for the "Edit Client" popup
    showEditClient: false,
    setShowEditClient: (show) => {
        if (show) {
            // Copy `client` to `editClient` when the popup opens
            const clientData = useClient.getState().client;
            useClient.setState({ editClient: { ...clientData } });
        } else {
            // Reset `editClient` when the popup closes
            useClient.setState({ editClient: nullClient });
        }
        set({ showEditClient: show });
    },
    showEditEntry: false,
    setShowEditEntry: (n, to) => {
        if( n < 0){
            set({showEditEntry: to })
            if(!to){
                useEntry.setState({ editEntry : nullEntry })
            }
        }else{
            if(to){
                set({showEditEntry: true })
                let entrys = useClient.getState().entries.filter(entry => entry.id == n)
                if (entrys.length != 1){
                    return
                }
                let entry = entrys[0]
                let modEntry = JSON.parse(JSON.stringify(entry)) as Entry
                console.log(entry)
                useEntry.setState({ editEntry : entry, modifyEntry: modEntry })
            }
        }
    },
    showNewClient: false,
    setShowNewClient: (to: boolean) => {
        set({ showNewClient: to})
        if(!to){
            useClient.setState({ newClient: nullClient })
        }
    },
    showNewOldClient: false,
    setShowNewOldClient: (to: boolean) => {
        set({ showNewOldClient: to})
        if(!to){
            useClient.setState({ newOldClient: nullClient })
        }
    },
    showSummary : false,
    setShowSummary: (to) => {
        set({ showSummary : to})
        if(to){
            useSummary.setState({startDate: getMondayOfCurrentWeek(), endDate: getEndOfDay()})
        }
    },
    showGetBackUp: false,
    setShowGetBackup: (to:boolean) => {
        set({ showGetBackUp : to })
    },
    showRestore: false,
    setShowRestore: (to:boolean) => {
        set({ showRestore : to })
    },
}));

export default usePopups;
