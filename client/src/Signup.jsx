import React from 'react';
import TextField from '@mui/material/TextField';

export const Signup = () => {
    return (
        <div className='flex flex-row'>
            <div className='bg-black h-[100vh] w-[60vw]'>
                <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.svg" className='w-[60vw] p-20' alt="Phone image" />
            </div>
            <div className='flex flex-col w-[40vw] h-[100vh] justify-center items-center'>
                <div >
                    <TextField id="outlined-basic" label="Outlined" variant="outlined" />
                </div>
                <div>
                    <TextField id="outlined-basic" label="Outlined" variant="outlined" />
                </div>
            </div>
        </div>
    );
};

export default Signup;
