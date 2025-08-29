 
import { create } from 'zustand'
import { ClientData, useClient } from './clientInfoStore'
import { getEntriesBetween, getSummarySheet } from '../api'


export type SummaryData = {
    entryId: number,
    date: number,
    clientName: string,
    clientId: number,
    clientFormerId: number,
    textile: number,
    material: number,
}
export type SummaryInfo ={
    summary: Array<SummaryData>,
    startDate: number,
    endDate: number
} 

type UseSummary  = {
    startDate: number,
    setStartDate: (n:number) => void,
    endDate: number,
    setEndDate: (n:number) => void,
    summaryData: Array<SummaryData>,
    setSummaryData: (to: Array<SummaryData>) => void
    fetchSummaryData:()=> void,
    fetchSummarySheet: () => void,
}


export const useSummary = create<UseSummary>((set, get) => (
    {
       startDate:0,
       setStartDate: (n) => {
        console.log(n)
            set({ startDate: n })
       },
       endDate: 0,
       setEndDate: (n) => {
            set({endDate: n})
       },
       summaryData: [] as Array<SummaryData>,
       setSummaryData: (s) =>{
        set({ summaryData: s})
       },
       fetchSummaryData: async () => {
        set({ summaryData: []})
        useClient.getState().fetchClients()
        let entries = await getEntriesBetween(get().startDate, get().endDate)
        const clientData = useClient.getState().clients
        let clientMap = new Map<number, ClientData>()

        for (let c of clientData){
            clientMap.set(c.id, c)
        }
        let summary = [] as Array<SummaryData>
        for( let e of entries){
            let s : SummaryData = {
                entryId: e.id,
                clientFormerId: clientMap.get(e.clientId)?.formerId ?? -5,
                date: e.date,
                clientName: clientMap.get(e.clientId)?.name  ?? "Tuntemation asiakas" ,
                clientId: e.clientId,
                textile: e.textile,
                material: e.material
            }
            summary.push(s)
    
        }

        set({ summaryData: summary})

       },
       fetchSummarySheet: async () => {
            let summary: SummaryInfo ={  summary: get().summaryData, startDate: get().startDate, endDate: get().endDate }
            await getSummarySheet(summary)
       },
    }
    
)) 




// export function generateSummary(){
//     const clientData = useClient.getState().clients
//     const entryData  = useClient.getState().allEntries
//     const startDate = useSummary.getState().startDate
//     const endDate = useSummary.getState().endDate

//     let clientMap = new Map<number, ClientData>()

//     for (let c of clientData){
//         clientMap.set(c.id, c)
//     }


//     let entries = entryData.filter(entry => entry.date >= startDate && entry.date <= endDate)

//     let summary = [] as Array<SummaryData>

//     for( let e of entries){
//         let s : SummaryData = {
//             entryId: e.id,
//             clientFormerId: clientMap.get(e.clientId)?.formerId ?? -5,
//             date: e.date,
//             clientName: clientMap.get(e.clientId)?.name  ?? "Tuntemation asiakas" ,
//             clientId: e.clientId,
//             textile: e.textile,
//             material: e.material
//         }
//         summary.push(s)

//     }
//     useSummary.setState({summaryData: summary.sort((a, b) => a.date - b.date)})


// }