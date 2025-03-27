import React, { useState } from 'react'
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

export const formatViews = (views) => {
  if (!views || typeof views !== "number") return "0";
  if (views >= 1_000_000) {
    return `${(views / 1_000_000).toFixed(1)}M`; // 1.2M
  } else if (views >= 1_000) {
    return `${(views / 1_000).toFixed(1)}K`; // 1.2K
  }
  return views.toString(); // Less than 1K
};

export const Description = ({ videoDetails }) => {
  const [isDescOpen, setIsDescOpen] = useState(false)


  const formatDate = (date) => {
    return dayjs(date).format("MMM DD, YYYY");
  };

  dayjs.extend(relativeTime);
  const formatTimeAgo = (date) => {
    return dayjs(date).fromNow();
  };
  return (
    <>
      {isDescOpen ? (
        // Expanded Description
        <div className="bg-[#292828] w-full mt-1 font-roboto font-semibold rounded-xl min-h-[80px] px-3 py-3">
          <div className="w-full h-[50%] font-medium">
            <span>{videoDetails.views} views</span>
            <span className="pl-3">{formatDate(videoDetails.createdAt)}</span>
          </div>
          <div className="w-full h-[50%] overflow-hidden">
            <p className="whitespace-pre-line">{videoDetails.description}</p>
            <br></br>
            <p className=' font-semibold cursor-pointer' onClick={() => setIsDescOpen(false)}>Show less</p>
          </div>
        </div>
      ) : (
        // Collapsed Description
        <div onClick={() => setIsDescOpen(true)} className="bg-[#292828] cursor-pointer w-full mt-1 font-roboto font-semibold rounded-xl min-h-[80px] px-3 py-3">
          {videoDetails ? (
            <>
              <div className="w-full h-[50%] font-medium">
                <span>{formatViews(videoDetails.views)} views</span>
                <span className="pl-3">{formatTimeAgo(videoDetails.createdAt)}</span>
              </div>
              <div className="w-full h-[50%] overflow-hidden">
                <p className="line-clamp-2 inline">{videoDetails.description}</p>
                <p className='inline font-semibold' onClick={() => setIsDescOpen(true)}>&nbsp;&nbsp;&nbsp;&nbsp;...more</p>
              </div>
            </>
          ) : (
            "loading..."
          )}
        </div>
      )}
    </>
  )
}

export default Description