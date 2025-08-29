import { Box, Button, FormControl, IconButton, Input, InputAdornment, InputLabel, Stack, TextField, Typography } from "@mui/material";
import { GeneratePasswordType, useLogIn } from "./stores/logInStore";
import { useEffect } from "react";
import { Label, Visibility, VisibilityOff } from "@mui/icons-material";
import React from "react";


export default  function LogIn(){
  const hasPassword = useLogIn((state)=> state.hasPassword)
  const checkHasPassword = useLogIn((state)=> state.checkHasPassword)
  const createPassword = useLogIn((state)=> state.createPassword)
  const setCreatePassword = useLogIn((state)=> state.setCreatePassword)
  const logInPassword = useLogIn((state)=> state.logInPassword)
  const setLogInPassword = useLogIn((state)=> state.setLogInPassword)
  const submitPassword = useLogIn((state)=> state.submitPassword)
  const logIn = useLogIn((state) => state.logIn)
  
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };
  const [showPassword, setShowPassword] = React.useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  useEffect(()=>{
    checkHasPassword()
  },[])

    return(
        <Box
          component="form"
          sx={{ '& .MuiTextField-root': { m: 1 } }}
          noValidate
          autoComplete="off"
          onSubmit={(e) => {
            e.preventDefault(); // Prevent page reload
            hasPassword ? logIn() : submitPassword();
          }}
        >
        {!hasPassword ? (
              <Stack>
                <Typography
                  color="black"
                >
                  Määritä käytön salasana
                </Typography>
                <FormControl sx={{ m: 1 }} variant="standard">
                  <InputLabel htmlFor="standard-adornment-password">Salasana</InputLabel>
                  <Input
                    id="standard-adornment-password"
                    type={showPassword ? 'text' : 'password'}
                    sx={{
                      width: "95%"
                    }}
                    value={createPassword.password}
                    onChange={e => { setCreatePassword( GeneratePasswordType.Password, e.target.value )}}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={
                            showPassword ? 'hide the password' : 'display the password'
                          }
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          onMouseUp={handleMouseUpPassword}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
                

                <FormControl sx={{ m: 1 }} variant="standard">
                  <InputLabel htmlFor="standard-adornment-password">Vahvista salasana</InputLabel>
                  <Input
                    id="standard-adornment-password"
                    type={'password'}
                    value={createPassword.checkPassword}
                    onChange={e => { setCreatePassword( GeneratePasswordType.CheckPassword, e.target.value )}}
                    sx={{
                      width: "95%"
                    }}
                  />
                </FormControl>
                <Button 
                  variant="contained"
                  sx={{
                    width: "97%"
                  }}
                  disabled={!((createPassword.checkPassword === createPassword.password) && (createPassword.password.length > 7) )}
                  onClick={() => submitPassword()}
                  >
                  Jatka
                </Button>
              </Stack>
            ) : (<></>)}

        {hasPassword ? (
              <Stack>
                <Typography
                  color="black"
                >
                  Anna salasana
                </Typography>
                <FormControl sx={{ m: 1 }} variant="standard">
                  <InputLabel htmlFor="standard-adornment-password">
                    Salasana
                  </InputLabel>
                  <Input
                    id="standard-adornment-password"
                    type={showPassword ? 'text' : 'password'}
                    value={logInPassword}
                    onChange={(e)=> setLogInPassword(e.target.value)}
                    sx={{
                      width: "95%"
                    }}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={
                            showPassword ? 'hide the password' : 'display the password'
                          }
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          onMouseUp={handleMouseUpPassword}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
                <Button 
                  variant="contained"
                  onClick={() => logIn()}
                  sx={{
                    width: "97%"
                  }}
                  >
                  Jatka
                </Button>
              </Stack>
            ) : (<></>)}
    </Box>
    )
}