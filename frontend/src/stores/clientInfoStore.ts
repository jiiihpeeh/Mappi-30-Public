import { create } from 'zustand'
import { cleanPhoneNumber } from '../utils'
import { getClientEntries, getClients, getClientSheet, insertClient, insertOldClient, modifyClient } from '../api';
import usePopups from './popUpStore';
import { InfoView, useInfoView } from './infoViewStore';
import { CheckIDAvail, CheckIDAvailNew } from '../../wailsjs/go/main/App';


export type Entry = {
    id: number,
    date: number,
    textile: number,
    material: number,
    modifier: string,
    clientId: number
}

export type ClientData ={
    id: number,
    formerId: number,
    name: string,
    address: string,
    email: string,
    phone: string,
    supporter: boolean,
    activeSupporter: boolean,
    information: string,
    modifier: string
}

export  type ClientInfo ={
    client: ClientData,
    entries: Entry[]
}
export enum ClientEnum {
    id = "id",
    formerId = "formerId",
    name = "name",
    address = "address",
    email = "email",
    phone= "phone",
    supporter = "supporter",
    activeSupporter = "activeSupporter",
    information = "information",
    modifier = "modifier"
}

type UseClient=  {
    clients: Array<ClientData>,
    fetchClients: () => void,
    setClients: (c: Array<ClientData>) => void,
    client: ClientData,
    setClient: (c: ClientData) => void,
    setClientById: (n:number) =>void,
    editClient: ClientData,
    setEditClient: (c: ClientData) => void,
    entries: Array<Entry>,
    setEntries: (a: Array<Entry>) => void,
    updateEditClient: (key: ClientEnum, value: string|boolean) => void,
    newClient: ClientData,
    setNewClient: (key: ClientEnum, value: string|boolean) => void,
    newOldClient: ClientData,
    setNewOldClient: (key: ClientEnum, value: string|boolean| number) => void,
    fetchNewClient: () => void,
    fetchOldNewClient: () => void,
    fetchUpdatedClient: () => void,
    fetchClientSheet: () =>  void,
    idInUse: boolean,
}

export const nullClient : ClientData = {
    id:-1,
    formerId: -1,
    name: "",
    address :"",
    email: "",
    phone: "",
    supporter: false,
    activeSupporter: false,
    information: "", 
    modifier: ""
}


export const useClient = create<UseClient>((set, get) => (
    {
       clients: [nullClient],
       fetchClients: async () =>{
          let resp = await getClients()
          if (resp === null){
            set({ clients: [] })
            return
          }
           set({ clients: resp })
       },
       setClients: (c: Array<ClientData>) =>{
            set({
                clients: c
            })
       },
       client: nullClient,
       setClient:  async (c : ClientData) => {
        set({
            client : c
        })
        let resp = await getClientEntries(c.id)
        if (resp === null){
            set({entries: []})
            return
        }
        set({entries: resp.sort((a, b) => a.date - b.date)})
       },
       setClientById: async (n) =>{
          let  resp = await getClientEntries(n)
          const client = get().clients.filter(entry => entry.id === n)
          
          
          if (client.length === 1){
            set({client: client[0], entries: resp.sort((a, b) => a.date - b.date)})
          }
       },
       editClient: nullClient,
       setEditClient(c) {
           set({
            editClient: c
           })
       },
       entries: [],
       setEntries: (a: Array<Entry>) =>{
            set({
                entries: a
            })
       },
       updateEditClient: async (key, value) =>{
            switch(key){
                case ClientEnum.phone:
                    if (typeof value === "string"){
                        set({
                            editClient: {...get().editClient, [key]: cleanPhoneNumber(value) }
                        })
                    }
                    break
                case ClientEnum.formerId:
                    let modValue = parseInt(`${value}`, 10)
                    if (isNaN(modValue)  ){
                        modValue =10000
                    }
                    let avail = await CheckIDAvail(get().editClient.id, modValue)
                    set( { idInUse: avail })
                    console.log(avail)
                    set({
                        editClient: {...get().editClient, [key]: Math.abs(modValue) }
                    })
                    break
                default:
                    set({
                        editClient: {...get().editClient, [key]: value }
                    })
                    break
            }
            switch(key){
                case ClientEnum.activeSupporter:
                    if (value){
                        set({
                            editClient: {...get().editClient, [ClientEnum.supporter]: true }
                        })
                    }
                break
                case ClientEnum.supporter:
                    if (!value){
                        set({
                            editClient: {...get().editClient, [ClientEnum.activeSupporter]: false }
                        })
                    }
                    break
                default:
                    break
                }

       },
       newClient: nullClient,
       setNewClient: (key: ClientEnum, value: string|boolean) => {
        switch(key){
            case ClientEnum.phone:
                if (typeof value === "string"){
                    set({
                        newClient: {...get().newClient, [key]: cleanPhoneNumber(value) }
                    })
                }
                break
            default:
                set({
                    newClient: {...get().newClient, [key]: value }
                })
                break
        }
        switch(key){
            case ClientEnum.activeSupporter:
                if (value){
                    set({
                        newClient: {...get().newClient, [ClientEnum.supporter]: true }
                    })
                }
            break
            case ClientEnum.supporter:
                if (!value){
                    set({
                        newClient: {...get().newClient, [ClientEnum.activeSupporter]: false }
                    })
                }
                break
            default:
                break
            }
       },
       newOldClient: nullClient,
       setNewOldClient: async (key: ClientEnum, value) => {
        switch(key){
            case ClientEnum.phone:
                if (typeof value === "string"){
                    set({
                        newOldClient: {...get().newOldClient, [key]: cleanPhoneNumber(value) }
                    })
                }
                break
            case ClientEnum.formerId:
                console.log("hmmmm")
                let modValue = parseInt(`${value}`, 10)
                if (isNaN(modValue)  ){
                    modValue =10000
                }
                let resp = await CheckIDAvailNew(modValue)
                set( { idInUse: resp } )
                set({
                    newOldClient: {...get().newOldClient, [key]: Math.abs(modValue) }
                })
                break
            default:
                set({
                    newOldClient: {...get().newOldClient, [key]: value }
                })
                break
        }
        switch(key){
            case ClientEnum.activeSupporter:
                if (value){
                    set({
                        newOldClient: {...get().newOldClient, [ClientEnum.supporter]: true }
                    })
                }
            break
            case ClientEnum.supporter:
                if (!value){
                    set({
                        newOldClient: {...get().newOldClient, [ClientEnum.activeSupporter]: false }
                    })
                }
                break
            default:
                break
            }
       },
       fetchNewClient: async () => {
            let resp = await insertClient(get().newClient)
            if (resp === null){
                return
            }insertOldClient
            let clients = [...get().clients, resp ]
            set({ clients: clients, client: resp, entries: [] })
            usePopups.setState( { showNewClient: false })
            useInfoView.setState({ infoView: InfoView.ClientData})
            set({newClient: nullClient})
       },
       fetchOldNewClient: async () =>{
            let resp = await insertOldClient(get().newOldClient)
            if (resp === null){
                return
            }
            let clients = [...get().clients, resp ]
            set({ clients: clients, client: resp, entries: [] })
            usePopups.setState( { showNewOldClient: false })
            useInfoView.setState({ infoView: InfoView.ClientData})
            set({newOldClient: nullClient})
       },
       fetchUpdatedClient: async () =>{
            let resp = await modifyClient(get().editClient.id, get().editClient)
            if (resp === null){
                return
            }
            let filteredClients = get().clients.filter(entry => entry.id != get().editClient.id)
            let clients = [...filteredClients, resp ].sort((a, b) => a.id - b.id)
            set({ clients: clients, client: resp })
            usePopups.setState( { showEditClient: false })
            useInfoView.setState({ infoView: InfoView.ClientData})
            set({editClient: nullClient})
            let entries = await getClientEntries(resp.id)
            if (entries === null){
                set({entries: []})
                return
            }
            set({entries: entries.sort((a, b) => a.date - b.date)})

       },
       fetchClientSheet: async () => {
        let content : ClientInfo = { client: get().client, entries: get().entries }
        await getClientSheet(content)
       },
       idInUse: false
    }
    
)) 

