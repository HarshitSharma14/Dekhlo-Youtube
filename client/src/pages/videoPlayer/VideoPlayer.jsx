import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import axios from 'axios';
import { GET_VIDEO } from '../../utils/constants';

const VideoPlayer = () => {

    const { videoId } = useParams()

    useEffect(() => {
        const getVideoData = async () => {
            const response = await axios.get(GET_VIDEO, {
                params: { videoId: videoId }
            })
            console.log(response.data)
        }
        getVideoData()
    }, [])

    return (


        <div className='w-screen h-screen bg-red'>
            {videoId}
        </div>
    )
}

export default VideoPlayer