import React from 'react';
import {
    TextField,
} from "@mui/material";
import Button from '@mui/material/Button';

import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

import Checkbox from '@mui/material/Checkbox';

export const Signup = () => {
    return (
        <div className='flex flex-row bg-gradient-to-r from-youtube-dark-blue to-youtube-dark-red'>
            <div >
                <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.svg" className='w-[60vw] p-20' alt="Phone image" />
            </div>
            <div className='flex flex-col w-[40vw] h-[100vh] justify-center items-center'>

                <div flex w->
                    <div className="space-y-8 p-4 max-w-md mx-auto w-[60%] justify-center items-center">
                        <TextField label="Email" variant="outlined" sx={{
                            color: 'black',
                            width: '100%',
                            borderRadius: '10px',  // Use a high value for fully rounded corners
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px', // Ensures the input itself is rounded
                                background: 'transparent'
                            },
                            '& .MuiInputLabel-root': {
                                color: 'black' // Change label color
                            },
                        }} />

                        {/* <input type="text" placeholder="Email" className="w-80 border rounded-md p-2" aria-label="Username" ></input> */}

                    </div>
                    <div className="space-y-8 p-4 max-w-md mx-auto w-[60%] justify-center items-center">
                        <TextField label="Password" variant="outlined" sx={{
                            color: 'black',
                            width: '100%',

                            borderRadius: '10px',  // Use a high value for fully rounded corners
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px', // Ensures the input itself is rounded
                                background: 'transparent'
                            },
                            '& .MuiInputLabel-root': {
                                color: 'black' // Change label color
                            },
                            // '& .MuiInputLabel-root.Mui-focused': {
                            //     color: 'green' // Change label color when focused
                            // }
                        }} />
                        {/* <input type="password" placeholder="Password" className="w-80 border rounded-md p-2" aria-label="Email"></input> */}
                    </div>

                    <div className='mb-5'>
                        <span className='mr-12'>
                            <FormControlLabel control={<Checkbox defaultChecked />} label="Label" />
                        </span>
                        <span className='ml-12'>
                            <a href="#" className="text-blue-900">Forgot Password ?</a>
                        </span>
                    </div>

                    <Button variant="contained" sx={{
                        width: '52%',
                        backgroundColor: 'rgb(59, 113, 182)',
                    }}>Sign In</Button>


                    <div>
                        <div class="flex-grow border-t border-gray-300"></div>
                        <span class="mx-2 text-gray-500 font-semibold">OR</span>
                        <div class="flex-grow border-t border-gray-300"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
