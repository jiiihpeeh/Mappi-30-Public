import { RecheckPassword,  RestoreCheck, RestoreFromArchive } from '../../wailsjs/go/main/App';
import { EventsOn } from '../../wailsjs/runtime/runtime'
import { create } from 'zustand'
import usePopups from './popUpStore';
import { models } from '../../wailsjs/go/models';




type UseRestore =  {
    validated: boolean,
    validationPassword: string,
    setValidationPassword: (s : string) => void,
    validate: () => void,
    encryption: boolean,
    setEncryption: (to:boolean) => void,
    encryptionPassword: string
    setEncryptionPassword: ( value: string) => void,
    runRestore: () => void,
    resetState: () => void,
    restoreInfo: models.BackupInfo
}



export const useRestore = create<UseRestore>((set, get) => (
    {
        validated: false,
        validationPassword: "",
        setValidationPassword: (s) => {
            set( { validationPassword:  s } )
        },
        validate: async () => {
           let answer =  await RecheckPassword(get().validationPassword)
           let restore : models.BackupInfo
           set({ validated: answer , validationPassword : "" }) 
           if(answer){
              restore = await RestoreCheck()
              console.log(restore)
              set ( { restoreInfo: restore } )
              if (restore.valid && !restore.encrypted){
                usePopups.setState( { showRestore : false})
                await RestoreFromArchive(restore)
              } else if (!restore.valid ) {
                set({  restoreInfo: { fileName: "", valid: false, encrypted: false, password: ""}, encryptionPassword: "" })
                usePopups.setState( { showRestore : false})
              }
            }
        },
        encryption: false,
        setEncryption: (to) => {
            set( { encryption : to } )
        },
        encryptionPassword: "",
        setEncryptionPassword: (value) => {
            set( { encryptionPassword: value } )
        },
        runRestore: async () => {
            let info = JSON.parse(JSON.stringify({...get().restoreInfo, password : get().encryptionPassword })) as models.BackupInfo
            set({  restoreInfo: { fileName: "", valid: false, encrypted: false, password: ""}, encryptionPassword: "" })
            usePopups.setState( { showRestore : false})

            await RestoreFromArchive(info)
        },
        resetState: () => {
            set({ validated : false ,  validationPassword: "", encryptionPassword: "" })
        },
        restoreInfo: { fileName: "", valid: false, encrypted: false, password: ""}
    }
)) 
