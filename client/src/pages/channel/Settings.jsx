import { Switch } from '@mui/material'
import React from 'react'

const Settings = () => {
    return (
        <div className=' w-full h-screen flex flex-col items-center justify-center'>
            <div className='flex w-[100%]  pl-5 flex-col md:w-[80%]   h-screen'>

                <div className='pt-5 text-5xl font-sans font-medium'>Settings</div>
                <div className='mt-5 pl-5  flex-row flex'>
                    <div>
                        <Switch defaultChecked />
                    </div>
                    <div className='flex-col flex pl-3'>
                        <div className='text-lg'>
                            Watch history
                        </div>
                        <div className='text-sm text-gray-500'>
                            Save videos I watch to my watch history.
                        </div>
                    </div>
                </div>
                <div className='pt-5 pl-2 text-2xl font-sans font-normal'>Notifications</div>
                <div className='mt-5 pl-5  flex-row flex'>
                    <div>
                        <Switch defaultChecked />
                    </div>
                    <div className='flex-col flex pl-3'>
                        <div className='text-lg'>
                            Subscriptions
                        </div>
                        <div className='text-sm text-gray-500'>
                            Notify me about new videos from my subscriptions.
                        </div>
                    </div>
                </div>
                <div className='mt-5 pl-5  flex-row flex'>
                    <div>
                        <Switch defaultChecked />
                    </div>
                    <div className='flex-col flex pl-3'>
                        <div className='text-lg'>
                            New subscribers
                        </div>
                        <div className='text-sm text-gray-500'>
                            Notify me about my new subscribers.
                        </div>
                    </div>
                </div>
                <div className='mt-5 pl-5  flex-row flex'>
                    <div>
                        <Switch defaultChecked />
                    </div>
                    <div className='flex-col flex pl-3'>
                        <div className='text-lg'>
                            Video Liked
                        </div>
                        <div className='text-sm text-gray-500'>
                            Notify me when someone likes my video.
                        </div>
                    </div>
                </div>
                <div className='mt-5 pl-5  flex-row flex'>
                    <div>
                        <Switch defaultChecked />
                    </div>
                    <div className='flex-col flex pl-3'>
                        <div className='text-lg'>
                            Comment Liked
                        </div>
                        <div className='text-sm text-gray-500'>
                            Notify me when someone likes my comment.
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Settings