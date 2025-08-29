 
import { create } from 'zustand'
import { CheckPassword, HasPassword, NewPassword, GetAllClients, LogOut } from '../../wailsjs/go/main/App'
import { InfoView, useInfoView } from './infoViewStore'
import { useClient } from './clientInfoStore'

export type GeneratePassword = {
    password : string,
    checkPassword: string
}

export enum GeneratePasswordType {
    Password = "password",
    CheckPassword ="checkPassword"
}

type UseLogIn=  {
    hasPassword: boolean,
    checkHasPassword: () => void,
    passwordChecked: boolean,
    checkPassword: (password : string) => void,
    newPassword: boolean,
    setNewPassword: (password: string)=> void,
    logInPassword: string,
    setLogInPassword: (password: string) => void,
    createPassword: GeneratePassword
    setCreatePassword: (key: GeneratePasswordType, value: string) => void,
    submitPassword: () => void,
    logIn: () => void,
    logOut: () => void
}


export const useLogIn = create<UseLogIn>((set,get) => (
    {
       hasPassword:false,
       checkHasPassword: async () => {
        set({ hasPassword : await HasPassword()}) 
       },
       passwordChecked: false,
       checkPassword: async (password) => {
        set({ passwordChecked: await CheckPassword(password) })
       },
       newPassword: false,
       setNewPassword: async ( password: string) => {
       set({ newPassword: await NewPassword(password)})
      },
      logInPassword: "",
      setLogInPassword: (password) => {
        set({ logInPassword: password})
      },
      createPassword: { password : "", checkPassword: "" },
      setCreatePassword: (key, value) => {
        set( {  createPassword : {...get().createPassword, [key] : value } } )
      },
      submitPassword: async () =>{
        let resp = await NewPassword(get().createPassword.password)
        set({ createPassword : {  password : "", checkPassword : "" }}) 
        if(resp){
            set({ hasPassword : await HasPassword()}) 
        }
      },
      logIn: async () => {
        let resp = await CheckPassword(get().logInPassword)
        set({ logInPassword : ""}) 
        if (resp){
            useClient.setState({ clients : await GetAllClients() })
            useInfoView.setState({ infoView : InfoView.Clients})
            set({ passwordChecked : true })
        }
      },
      logOut: async () => {
        await LogOut()
        set({ passwordChecked : false })
        useInfoView.setState({ infoView : InfoView.LogIn})
      }
}
)) 

