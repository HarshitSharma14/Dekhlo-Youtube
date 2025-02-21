import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Plyr from "plyr";
import "plyr/dist/plyr.css";
import { PiShareFatLight } from "react-icons/pi";
import axios from "axios";
import { GET_VIDEO } from "../../utils/constants";
import VideoDetails from "../../component/VideoDetails";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import { BsThreeDots } from "react-icons/bs";
import Description from "../../component/Description";
import WatchNext from "../../component/WatchNext";
const VideoPlayer = () => {
  // states and refs
  const { videoId } = useParams();
  const [videoDetails, setVideoDetails] = useState({});

  const playerRef = useRef(null); // Reference to the video element

  // use effects
  useEffect(() => {
    const getVideoData = async () => {
      try {
        const response = await axios.get(`${GET_VIDEO}/${videoId}`, {
          withCredentials: true,
        });
        console.log(response.data.video);
        setVideoDetails(response.data.video);
      } catch (error) {
        console.error("Error fetching video data:", error);
      }
    };
    getVideoData();
  }, []);

  // useEffect(() => {
  //     if (playerRef.current && videoDetails.videoUrl) {

  //         const player = new Plyr(playerRef.current, {
  //             autoplay: true, quality: {
  //                 default: 1080,
  //                 options: [1080, 720, 480],
  //                 forced: true,
  //                 onend: true,
  //             },
  //             settings: ['quality', 'speed'],
  //             fullscreen: {
  //                 enabled: true,
  //                 fallback: true, // Ensures a fallback for unsupported browsers
  //                 iosNative: true,
  //             },
  //         });

  //         return () => {
  //             player.destroy();  // Clean up when the component is unmounted
  //         };
  //     }
  // }, [videoDetails]);  // Re-run when videoDetails change

  // functions

  const openDiscription = () => {};

  return (
    <div
      style={{
        paddingLeft: "clamp(0.5rem, 5vw, 8.25rem)", // Adjusts padding based on screen width
        paddingRight: "clamp(0.5rem, 5vw, 8.25rem)", // Adjusts padding based on screen width
        transition: "padding 0.3s ease", // Smooth transition
      }}
      className="bg-[#121212] flex flex-col lg:flex-row w-full h-full mx-auto  box-border overflow-x-hidden"
    >
      {/* Left Side */}
      <div className="flex flex-col w-full h-full max-w-full lg:w-[60%] box-border">
        {/* Video Player */}
        <div className="w-full flex justify-center box-border">
          {videoDetails.videoUrl ? (
            <video
              className="w-full h-auto max-h-[70vh] lg:max-h-[60vh] object-contain rounded-2xl"
              ref={playerRef}
              controls
              allowfullScreen="true"
              crossOrigin="anonymous"
              poster={videoDetails.thumbnailUrl}
            >
              <source src={videoDetails.videoUrl} type="video/mp4" />
            </video>
          ) : (
            <p>Loading video...</p>
          )}
        </div>

        {/* Description */}
        <div className="bg-[#121212] mt-3 flex-1 flex-col lg:max-w-[748px] w-full max-w-[100vw] box-border">
          <div className="w-full h-auto min-h-[100px] flex flex-col box-border">
            <div className="p-2 h-auto box-border">
              {/* Title */}
              <div className="max-h-[60px] min-h-[40px] font-roboto font-bold text-xl text-white line-clamp-2">
                {videoDetails.title || "Loading..."}
              </div>

              {/* Channel and buttons */}
              <div className="min-h-[50px] h-auto font-roboto text-xl text-white flex flex-wrap xs:flex-nowrap xs:justify-between box-border">
                {videoDetails.channel ? (
                  <div className="flex flex-row items-center w-full xs:w-auto flex-grow box-border">
                    {/* Channel profile photo */}
                    <div className="w-[50px] flex-none rounded-full h-[50px] box-border">
                      <img
                        className="w-full rounded-full h-full object-cover"
                        src={videoDetails.channel.profilePhoto}
                        alt="Channel Profile"
                      />
                    </div>

                    {/* Channel name and subscribers */}
                    <div className="flex flex-col w-auto pl-3 box-border">
                      <div className="text-white text-sm font-roboto font-bold truncate">
                        {videoDetails.channel.channelName}
                      </div>
                      <div className="text-gray-400 text-sm truncate">
                        {videoDetails.channel.followers.length} subscribers
                      </div>
                    </div>

                    {/* Subscribe button */}
                    <div className="h-[36px] ml-3 hover:bg-slate-200 w-[94.6px] rounded-3xl bg-white text-black text-sm flex-none flex justify-center items-center box-border">
                      Subscribe
                    </div>
                  </div>
                ) : (
                  <p>Loading channel details...</p>
                )}

                {/* Buttons */}
                <div className="w-full xs:w-auto mt-3 xs:mt-0 xs:justify-end flex items-center justify-evenly box-border">
                  <div className="w-[80px] h-[36px] rounded-3xl flex flex-row justify-evenly hover:bg-[#635f5f] px-3 text-sm items-center bg-[#2e302f] box-border">
                    <ThumbUpOffAltIcon /> {videoDetails.likes}
                  </div>

                  <div className="w-[40px] h-[36px] rounded-3xl flex flex-row justify-evenly ml-3 hover:bg-[#635f5f] items-center bg-[#2e302f] box-border">
                    <PiShareFatLight />
                  </div>

                  <div className="w-[40px] h-[36px] rounded-3xl flex flex-row justify-evenly hover:bg-[#635f5f] ml-3 items-center bg-[#2e302f] box-border">
                    <BsThreeDots />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description Component */}
          <div className="w-full max-w-[100vw] overflow-hidden box-border">
            <Description videoDetails={videoDetails} />
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="hidden lg:flex flex-col w-[40%] bg-white h-auto box-border lg:mx-6">
        {/* Right side content */}
        <WatchNext />
      </div>
    </div>
  );
};

export default VideoPlayer;
