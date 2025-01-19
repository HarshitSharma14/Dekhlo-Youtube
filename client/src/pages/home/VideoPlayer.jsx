import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Header from '../../component/Header'
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import { VIDEO_ROUTE } from '../../utils/constants';
import axios from 'axios';

const VideoPlayer = () => {

    const { videoId } = useParams()

    useEffect(() => {
        const getVideoData = async () => {
            const response = await axios(VIDEO_ROUTE, {
                params: { videoId: videoId }
            })
            console.log(response.data)
        }
        getVideoData()
    }, [])

    return (
        <div className='w-screen h-screen bg-red'>

        </div>
    )
}

export default VideoPlayer