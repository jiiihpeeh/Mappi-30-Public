import { create } from 'zustand'
import usePopups from './popUpStore'
import { dateStringToUnix } from '../utils'
import dayjs, { Dayjs } from 'dayjs'
import { Entry, useClient } from './clientInfoStore'
import { deleteEntry, insertEntry, modifyEntry } from '../api'



export enum AllowedEntries {
    date = "date",
    textile = "textile",
    material = "material",
    clientId = "clientId"
}

export const nullEntry : Entry = { id: -1, date: 0 ,  textile: 0, material: 0, clientId:-1, modifier: ""}


type UseEntry=  {
    editEntry: Entry,
    removeId : number,
    setRemoveId: (o: number) => void,
    addEntry: number,
    setAddEntry: (n:number) => void,
    newEntry: Entry,
    setNewEntryValue: (key: AllowedEntries, value:string) => void,
    modifyEntry: Entry,
    modifyEntryCopy: Entry,
    setModifyEntryValue: (key: AllowedEntries, value:string) => void,
    entryDate: Dayjs,
    fetchModifiedEntry: () => void,
    fetchRemoveEntry: () => void,
    fetchNewEntry: () => void,
}

export const useEntry = create<UseEntry>((set,get) => (
    {
        editEntry : nullEntry,
        removeId: -1,
        setRemoveId: (n:number)=>{
            set({
                removeId: n
            })
            if (n > -1 ){
                usePopups.setState({showDeleteEntry : true})
            }
        },
        addEntry: -1,
        setAddEntry: (n:number) =>{
            set({
                addEntry : n
            })

        },
        newEntry: nullEntry, 
        setNewEntryValue: (key, value) => {
            switch(key){
                case AllowedEntries.date:
                    set({newEntry: { ...get().newEntry,   [key]: dateStringToUnix(value)}})
                    set({  entryDate: dayjs(dateStringToUnix(value) * 1000) })
                    break
                case AllowedEntries.clientId:
                    set({newEntry: { ...get().newEntry,   [key]: parseInt(value)}})
                    break
                default:
                    set({newEntry: { ...get().newEntry,   [key]: parseFloat(value.replace(/\./g, "").replace(",", ".")),   }})
                    break
            }

        },
        modifyEntry: nullEntry,
        modifyEntryCopy: nullEntry,
        setModifyEntryValue: (key: AllowedEntries, value:string) => {
            switch(key){
                case AllowedEntries.date:
                    set({modifyEntry: { ...get().modifyEntry,   [key]: dateStringToUnix(value)}})
                    set({ entryDate: dayjs(dateStringToUnix(value) * 1000)})
                    break
                case AllowedEntries.clientId:
                    set({modifyEntry: { ...get().modifyEntry,   [key]: parseInt(value)}})
                    break
                default:
                    set({modifyEntry: { ...get().modifyEntry,   [key]: parseFloat(value.replace(/\./g, "").replace(",", ".")),   }})
                    break
            }
        },
        entryDate: dayjs(),
        fetchModifiedEntry: async () => {
            let resp = await modifyEntry(get().modifyEntry.id, get().modifyEntry)
            let entries = useClient.getState().entries.filter(entry=> entry.id != resp.id) 
            entries = [...entries, resp ].sort((a, b) => a.date - b.date)
            useClient.setState({ entries : entries})
            usePopups.setState({ showEditEntry: false})

        },
        fetchRemoveEntry: async () => {
            let resp = await deleteEntry(get().removeId)
            console.log(resp)
            let entries = useClient.getState().entries
            entries = entries.filter(entry => entry.id != get().removeId)
            useClient.setState( { entries: entries})
            usePopups.setState({ showDeleteEntry: false})
        },
        fetchNewEntry: async () =>{
            let resp = await insertEntry(get().newEntry)
            console.log (resp)
            let entries = useClient.getState().entries
            entries  = [...entries, resp] .sort((a, b) => a.date - b.date)
            useClient.setState({entries: entries})
            set({ newEntry : nullEntry})
            usePopups.setState({showNewEntry : false})
        }
    }
    
))