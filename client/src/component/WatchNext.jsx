import React from 'react';
import LongVideoCard from './cards/LongVideoCard';

const WatchNext = ({ videos }) => {
    return (
        <>
            {videos.map((video, index) => (
                <LongVideoCard key={index} video={video} />
            ))}
        </>
    );
};

export default WatchNext;
