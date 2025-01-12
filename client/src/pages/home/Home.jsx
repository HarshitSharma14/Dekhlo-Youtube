import React, { useEffect } from 'react'
import { server } from '../../utils/constants'
import { useState } from 'react'
import axios from 'axios'
const Home = () => {

    const [name, setName] = useState("")
    const [dp, setDp] = useState("")

    useEffect(() => {
        try {
            axios.get(`${server}/auth/channel`, { withCredentials: true })
                .then((res) => {
                    console.log(res.data)
                    setName(res.data.channelName)
                    setDp(res.data.profilePhoto)
                })
        }
        catch (err) {
            console.log(err)
        }
    }, [])
    return (
        <>
            <div className='rounded-full w-[20%]'>
                <img src={`${dp}`} />
            </div>
            <div>{`${name}`}</div>
            <div>
                <a href={`${server}/auth/logout`}>Logout</a>
            </div>

        </>
    )
}

export default Home