 
import { create } from 'zustand'
import { useLogIn } from './logInStore'

export enum InfoView{
    LogIn = "login",
    Clients = "clients",
    ClientData ="clientdata",
    Summary = "summary",
}

type UseInfoView =  {
    infoView: InfoView,
    setInfoView: (to: InfoView) => void   
}




export const useInfoView = create<UseInfoView>((set) => (
    {
       infoView: InfoView.LogIn,
       setInfoView: (to:InfoView) => {
        let passwordChecked = useLogIn.getState().passwordChecked
        if(!passwordChecked){
            set({infoView: InfoView.LogIn})
            return
        }
        set({infoView: to})
       }  
    }
)) 

