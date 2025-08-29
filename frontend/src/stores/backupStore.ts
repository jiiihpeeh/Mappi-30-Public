 import { create } from 'zustand'
import { GetBackUp, RecheckPassword } from '../../wailsjs/go/main/App'
import usePopups from './popUpStore'


type EncryptionPassword = {
    password: string,
    check: string
}

export enum EncryptionPasswordEnum{
    Password = "password",
    Check = "check"
}

type UseBackup =  {
    validated: boolean,
    validationPassword: string,
    setValidationPassword: (s : string) => void,
    validate: () => void,
    encryption: boolean,
    setEncryption: (to:boolean) => void,
    encryptionPassword: EncryptionPassword
    setEncryptionPassword: (key: EncryptionPasswordEnum, value: string) => void,
    generateBackup: () => void,
    resetState: () => void,
}



export const useBackup = create<UseBackup>((set, get) => (
    {
        validated: false,
        validationPassword: "",
        setValidationPassword: (s) => {
            set( { validationPassword:  s } )
        },
        validate: async () => {
           set({ validated: await RecheckPassword(get().validationPassword) , validationPassword : "" })
        },
        encryption: true,
        setEncryption: (to) => {
            set( { encryption : to} )
        },
        encryptionPassword: {password: "", check: ""},
        setEncryptionPassword: (key, value) => {
            set( { encryptionPassword: { ...get().encryptionPassword, [key]: value  }} )
        },
        generateBackup: async () => {
            if(get().encryption){
                await GetBackUp(true, get().encryptionPassword.password)
            }else{
                await GetBackUp(false, "")
            }
            usePopups.setState({ showGetBackUp: false})
            set({ validated : false ,  validationPassword: "", encryptionPassword: {password: "", check: ""} })
           
        },
        resetState: () => {
            set({ validated : false ,  validationPassword: "", encryptionPassword: {password: "", check: ""} })
        }
    }
)) 
