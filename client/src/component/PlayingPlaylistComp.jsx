import React from 'react';
import LongVideoCard from './cards/LongVideoCard';
import CloseIcon from '@mui/icons-material/Close';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import RepeatIcon from '@mui/icons-material/Repeat';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
const PlayingPlaylistComp = ({ playlist, playingVideoId }) => {
    const navigate = useNavigate()

    const navigateToVideo = (videoId) => {
        console.log('navingatinggggggggggggggggggggg')
        navigate(`/video-player/${videoId}?playlist=${playlist._id}`)
        setTimeout(() => {
            navigate(0); // Force page reload (not recommended but works)
        }, 0);
        return
    }

    const closePlaylist = () => {
        navigate(`/video-player/${playingVideoId}`)
        setTimeout(() => {
            navigate(0); // Force page reload (not recommended but works)
        }, 0);
        return
    }

    const repeat = () => { }

    const shuffle = () => { }

    return (
        <>
            <div className="flex flex-col rounded-t-2xl pl-2 bg-[#292828]">
                {/* upar wala */}
                <div className="flex flex-row">
                    {/* headings */}
                    <div className="flex flex-col w-[90%] pt-1">
                        {/* title */}
                        <div className="font-roboto font-bold text-3xl pl-2 pt-1 ">{playlist?.name}</div>
                        <div className="font-roboto font-normal text-sm pl-2 pt-2">{playlist.channel?.channelName}</div>
                    </div>
                    <div className="flex self-center">
                        <CloseIcon fontSize="large" onClick={closePlaylist} className='cursor-pointer' />
                        {/* cross */}
                    </div>
                </div>
                <div className=" flex flex-row w-full justify-between pt-3 pb-3">
                    <div className="pl-2">
                        <RepeatIcon fontSize="medium" onClick={repeat} className='mr-3 cursor-pointer' />
                        <ShuffleIcon fontSize="medium" onClick={shuffle} className='cursor-pointer' />
                    </div>
                    {/* <div className="pr-3">
                        <BsThreeDotsVertical className='cursor-pointer'/>
                    </div> */}
                    {/* buttons */}
                </div>
            </div>
            <div className="mt-1 overflow-y-auto overflow-x-hidden">
                {/* niche wala */}
                {console.log(playingVideoId)}
                {playlist?.videos?.map((video, index) => {
                    return (
                        <div onClick={() => navigateToVideo(video._id)} className={`py-1 px-2 ${video._id === playingVideoId ? "bg-[#362323]" : ""} hover:bg-[#545151]`} key={index}>
                            {/* console.log(video) */}
                            <LongVideoCard
                                remove={"Remove from Watch histor"}
                                video={video}
                            />
                        </div>
                    )
                })}
            </div>
        </>
    );
};

export default PlayingPlaylistComp;
