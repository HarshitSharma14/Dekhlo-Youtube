import { CloseSharp } from '@mui/icons-material'
import React from 'react'
import { BsCrosshair2 } from 'react-icons/bs'
import { PiCross } from 'react-icons/pi'
import { useAppStore } from '../store'
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { motion } from "framer-motion";


const Notifications = ({ toggle }) => {

    dayjs.extend(relativeTime);
    const formatTimeAgo = (date) => {
        return dayjs(date).fromNow();
    };

    const { notifications } = useAppStore()

    return (
        <div className='bg-[#303030] w-full h-auto flex flex-col'>
            <div className='flex flex-row justify-between px-2 pt-2 pb-3 bg-[#303030] border-b-gray-300 sticky z-50 top-0 border-b-[1px] '>
                <div className='text-xl font-roboto'>Notifications</div>
                <div ><CloseSharp onClick={toggle} /></div>
            </div>

            {console.log(notifications.length)}
            {notifications?.map((notification, index) => (
                <div key={index} className='py-3 px-2 border-b-gray-600 flex-col font-sans flex border-b-[1px]'>
                    <div dangerouslySetInnerHTML={{ __html: notification?.message }}></div>
                    <div className='text-gray-500'>{formatTimeAgo(notification?.createdAt)}</div>
                </div>

            ))}

            {notifications.length === 0 &&
                <div className='h-[200px] font-mono justify-center mx-auto my-auto pt-10 text-lg'>
                    No notifications..
                </div>}


        </div>
    )
}

export default Notifications