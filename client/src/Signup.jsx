import React, { useState } from "react";

import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    Box,
    TextField,
    Typography,
} from "@mui/material";
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
    IconButton,
    InputAdornment
} from "@mui/material";
import GoogleIcon from '@mui/icons-material/Google';
import Checkbox from '@mui/material/Checkbox';
import { googleLoginUrl, server } from "./utils/constants";

import axios from "axios"

export const Signup = () => {

    const [isLoggingIn, setIsLoggingIn] = useState(false)

    const navigate = useNavigate();
    const [validEmail, setValidEmail] = useState(true)
    const [showPassword, setShowPassword] = useState(false);

    const [email, setEmail] = useState("")

    const [formErrors, setFormErrors] = useState({
        password: "",
        email: "",
    });

    const [validPassword, setValidPassword] = useState(true)
    const [password, setPassword] = useState("")

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const handleChange = (e) => {
        if (e.target.name === "email") {
            setFormErrors({ ...formErrors, email: "" });
            const newEmail = e.target.value;
            setEmail(newEmail)
            setValidEmail(emailRegex.test(newEmail))
            if (!emailRegex.test(newEmail)) {
                setFormErrors({ ...formErrors, email: "Please enter a valid email." });
            }
        }
        else {
            setFormErrors({ ...formErrors, password: "" });
            const newPassword = e.target.value;
            setPassword(newPassword);
            if (newPassword.length < 6) {
                setFormErrors({ ...formErrors, password: "Password must be atleast 6 characters long." });
            }
            setValidPassword(!(newPassword.length < 6))
        }
    }


    const handleLogin = async () => {

        try {

            setIsLoggingIn(true);
            const response = await axios(`${server}/login}`, { email, password }, { withCredentials: true })


            console.log(response)

        }
        catch (e) {
            if (e.response) {
                if (e.response.status === 400) {
                    toast.error("Please enter both email and password.");
                } else if (e.response.status === 401) {
                    toast.error("Passowrd Incorrect");
                }
                else if (e.response.status === 404) {
                    toast.error("User hasn't signed up yet. Please sign up");
                }
            } else {
                toast.error("Network error. Please check your connection."); // Handle network errors
            }
        }
        setIsLoggingIn(false);
    }

    return (
        <div className='flex lg:flex-row flex-col bg-gradient-to-r from-youtube-dark-blue to-youtube-dark-red h-screen w-screen'>

            {/* Background image for small screens */}
            <div className="hidden lg:block">
                <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.svg"
                    className='w-[60vw] p-20'
                    alt="Phone image"
                />
            </div>

            {/******************************* Card ***************************************/}
            <div className='absolute lg:static flex flex-col w-full lg:w-[40vw] h-full justify-center items-center'>

                <Box className="card"
                    sx={{
                        padding: 4,
                        borderRadius: 2,
                        boxShadow: 5,
                        width: "90%",
                        maxWidth: "470px",
                        minHeight: "550px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-evenly",
                        alignItems: "center",
                        backgroundColor: "#573c3c1a",
                        backdropFilter: "blur(10px)",
                    }}>
                    <Typography
                        variant="h6"
                        mb={2} mt={2}
                        sx={{
                            textAlign: "center",
                            fontWeight: "600",
                        }}
                    >
                        Login
                    </Typography>

                    <div className="space-y-8 max-w-md mx-auto w-[90%] justify-center items-center">
                        <TextField label="Email" required variant="outlined" name="email" value={email} onChange={handleChange} sx={{
                            width: '100%',
                        }}
                            error={!validEmail}
                            helperText={formErrors.email} />
                    </div>

                    <div className="space-y-8 max-w-md mx-auto w-[90%] justify-center items-center">
                        <TextField label="Password" required name="password" type={showPassword ? "text" : "password"} value={password} onChange={handleChange} variant="outlined"
                            sx={{ width: '100%' }}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword((e) => !e)}
                                                edge="end"
                                            >
                                                {showPassword ? (
                                                    <VisibilityOff />
                                                ) : (
                                                    <Visibility />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            error={!validPassword}
                            helperText={formErrors.password}
                        />
                    </div>

                    <div className='w-[80%] flex justify-between items-center'>
                        <span>
                            <FormControlLabel control={<Checkbox defaultChecked />} label="Remember me" sx={{
                                '& .MuiFormControlLabel-label': {
                                    fontSize: '0.9rem', // Adjust size as needed
                                }
                            }} />
                        </span>
                        <span className='ml-12 flex justify-self-end'>
                            <a href="#" className="text-blue-900">Forgot Password?</a>
                        </span>
                    </div>

                    <Button variant="contained" sx={{
                        width: '90%',
                        height: '50px',
                        padding: '10px',
                        fontSize: '1rem',
                        type: 'submit',
                        backgroundColor: 'rgb(59, 113, 182)',
                    }} onClick={handleLogin} disabled={!validEmail || !validPassword || isLoggingIn || !email.length || !password.length}>Log In</Button>

                    <div className="flex items-center w-[60%]">
                        <div className="flex-grow border-t border-[#e5e7eb]"></div>
                        <div className="mx-4 text-white font-semibold">OR</div>
                        <div className="flex-grow border-t border-[#e5e7eb]"></div>
                    </div>

                    <div className="w-full flex justify-center">
                        <a href={googleLoginUrl} className="w-[90%]">
                            <Button variant="contained"
                                sx={{
                                    width: '100%',
                                    height: '50px',
                                    fontSize: '1rem',
                                    padding: '10px',
                                    backgroundColor: 'rgb(59, 113, 182)',
                                }} disabled={isLoggingIn} onClick={() => setIsLoggingIn(true)}>
                                <GoogleIcon fontSize="large" color="action" className="pr-3" />
                                Continue with Google
                            </Button>
                        </a>
                    </div>
                </Box>
            </div >
        </div >
    );
};

export default Signup;








