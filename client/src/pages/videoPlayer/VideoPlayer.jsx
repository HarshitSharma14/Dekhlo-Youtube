import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Plyr from "plyr";
import "plyr/dist/plyr.css";
import { PiShareFatLight } from "react-icons/pi";
import axios from "axios";
import {
  GET_COMMENTS,
  GET_PLAY_NEXT,
  GET_PLAYLIST_VIDEOS,
  GET_VIDEO,
  GET_WATCH_NEXT,
  LIKE_UNLIKE,
  PUT_COMMENT,
} from "../../utils/constants";
import RepeatIcon from '@mui/icons-material/Repeat';
import CloseIcon from '@mui/icons-material/Close';
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import { BsThreeDots } from "react-icons/bs";
import Description from "../../component/Description";
import { BsThreeDotsVertical } from "react-icons/bs";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ShuffleIcon from '@mui/icons-material/Shuffle';
import Comments from "../../component/Comments";
import toast from "react-hot-toast";
import { TextField } from "@mui/material";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { debounce } from "lodash";
import { useAppStore } from "../../store";
import LongVideoCard from "../../component/cards/LongVideoCard";
import { useSearchParams } from "react-router-dom";
import PlayingPlaylistComp from "../../component/playingPlaylistComp";
import { useNavigate } from "react-router-dom";
import { Global } from '@emotion/react';
import { styled } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { grey } from '@mui/material/colors';
// import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';



const VideoPlayer = () => {
  const { channelInfo } = useAppStore();

  const navigate = useNavigate();

  // states and refs


  const { videoId } = useParams();
  const [videoDetails, setVideoDetails] = useState({});

  const playerRef = useRef(null); // Reference to the video element
  const [loggedIn, setLoggedIn] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [watchNext, setWatchNext] = useState([])
  const [cursor, setCursor] = useState(null)
  const [watchNextLoading, setWatchNextLoading] = useState(false)
  const [watchNextHasMore, setWatchNextHasMore] = useState(true)
  const lastElementRef = useRef(null);
  const [playingPlaylist, setPlayingPlaylist] = useState(false)
  const [playlist, setPlaylist] = useState([])
  const plyrInstance = useRef(null); // Ref for Plyr instance

  const [searchParams] = useSearchParams();
  const queryValue = searchParams.get("playlist"); // Get query param 'q'
  const playlistId = queryValue

  useEffect(() => {
    if (queryValue) {
      console.log("playlist", queryValue)
      setPlayingPlaylist(true);

      const getPlaylistVideos = async () => {
        const response = await axios.get(`${GET_PLAYLIST_VIDEOS}?playlistId=${playlistId}`, { withCredentials: true })
        console.log(response.data)
        setPlaylist(response.data.playlist)
      }

      getPlaylistVideos()

    }
  }, [queryValue, playlistId]);



  // use effects


  const getWatchNext = async () => {
    if (watchNextLoading || !watchNextHasMore) return

    setWatchNextLoading(true)

    try {
      const response = await axios.get(`${GET_WATCH_NEXT}/${videoId}?cursor=${cursor}`);
      if (response.data.watchNext.length === 0) {
        setWatchNextHasMore(false)
      }
      else {
        setWatchNext((watchNext) => [...watchNext, ...response.data.watchNext]);
        console.log(response)
        setCursor(response.data.watchNext[response.data.watchNext.length - 1]?._id);
        console.log(response.data.watchNext[response.data.watchNext.length - 1].title)
      }
      setWatchNextLoading(false);
    } catch (error) {
      console.error("Error fetching video data:", error);
    }
  };

  useEffect(() => {
    const fetchInitialVideos = async () => {
      const res = await axios.get(`${GET_WATCH_NEXT}/${videoId}`);
      console.log(res)
      setWatchNext(res.data.watchNext);
      setCursor(res.data.watchNext[res.data.watchNext.length - 1]._id);
    };

    fetchInitialVideos(); // Fetch first batch when component mounts
  }, []);

  // Use Intersection Observer to detect when the last item is visible
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        getWatchNext(); // Fetch more data when last item appears
        console.log('innnn')
      }
    });

    if (lastElementRef.current) observer.observe(lastElementRef.current);
    return () => observer.disconnect();
  }, [watchNext]); // Re-run when videos change



  // getting video data
  useEffect(() => {
    const getVideoData = async () => {
      try {
        const response = await axios.get(`${GET_VIDEO}/${videoId}`, {
          withCredentials: true,
        });
        setLoggedIn(response.data.loggedIn);
        setLikes(response.data.video.likes);
        console.log(response.data.video);
        console.log("login ", response.data.loggedIn);
        console.log("liked ", response.data.isLiked);
        setIsLiked(response.data.isLiked);
        setVideoDetails(response.data.video);
        // console.log(channelInfo)
      } catch (error) {
        console.error("Error fetching video data:", error);
      }
    };
    getVideoData();
  }, [videoId]);

  const player = new Plyr(playerRef.current, {
    autoplay: true, quality: {
      default: 1080,
      options: [1080, 720, 480],
      forced: true,
      onend: true,
    },
    settings: ['quality', 'speed'],
    fullscreen: {
      enabled: true,
      fallback: true, // Ensures a fallback for unsupported browsers
      iosNative: true,
    },
  });



  const navigateToVideo = (videoIdNew) => {
    console.log('navingatinggggggggggggggggggggg')
    navigate(`/video-player/${videoIdNew}`)
    setTimeout(() => {
      navigate(0); // Force page reload (not recommended but works)
    }, 0);
    return
  }

  useEffect(() => {
    const getPlayNext = async () => {
      try {
        const response = await axios.get(`${GET_PLAY_NEXT}/${videoId}`);
      } catch (error) {
        console.error("Error fetching video data:", error);
      }
    };
  }, []);

  useEffect(() => {
    if (playerRef.current && videoDetails.videoUrl) {
      // Initialize Plyr
      plyrInstance.current = new Plyr(playerRef.current, {
        autoplay: true,
        controls: [
          "play",
          "progress",
          "current-time",
          "mute",
          "volume",
          "settings",
          "fullscreen",
        ],
        settings: ['quality', 'speed'],
        fullscreen: { enabled: true, fallback: true, iosNative: true },
        quality: {
          default: 1080,
          options: [1080, 720, 480], // Available quality levels
          forced: true,
        },
      });

      return () => {
        // Destroy Plyr instance on unmount
        plyrInstance.current?.destroy();
      };
    }
  }, [videoDetails.videoUrl]);

  // useEffect(() => {
  //     if (playerRef.current && videoDetails.videoUrl) {

  // functions

  const openDiscription = () => { };

  //         return () => {
  //             player.destroy();  // Clean up when the component is unmounted
  //         };
  //     }
  // }, [videoDetails]);  // Re-run when videoDetails change

  // functions

  const handleLike = async () => {
    console.log(loggedIn);
    if (!loggedIn) {
      toast.error("Please login to like the video");
      return;
    }
    try {
      console.log(!isLiked);
      const response = await axios.patch(
        `${LIKE_UNLIKE}/${videoId}`,
        { isLiked: !isLiked },
        { withCredentials: true }
      );
      setLikes(response.data.likes);
      console.log(response.data);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error liking video:", error);
    }
  };

  dayjs.extend(relativeTime);
  const formatTimeAgo = (date) => {
    return dayjs(date).fromNow();
  };

  return (
    <>
      <div
        style={{
          paddingLeft: "clamp(0.5rem, 5vw, 8.25rem)", // Adjusts padding based on screen width
          paddingRight: "clamp(0.5rem, 5vw, 8.25rem)", // Adjusts padding based on screen width
          transition: "padding 0.3s ease", // Smooth transition
        }}
        className="bg-[#121212] flex flex-col lg:flex-row w-full h-full mx-auto  box-border overflow-x-hidden"
      >
        {/* Left Side */}
        <div className="flex flex-col w-full h-auto max-w-full lg:w-[65%] box-border">
          {/* Video Player */}
          <div className="w-full flex justify-center box-border">
            {videoDetails.videoUrl ? (
              <video
                className="plyr-video w-full h-full max-h-[90vh] object-contain rounded-2xl"

                ref={playerRef}
                controls
                // allowFullScreen="true"
                crossOrigin="anonymous"
                poster={videoDetails.thumbnailUrl}
              >
                <source src={videoDetails.videoUrl} type="video/mp4" />
              </video>
            ) : (
              <p>Loading video...</p>
            )}
          </div>

          <div className={`border-2 lg:hidden rounded-2xl border-gray-500 flex flex-col w-full max-h-[500px] mb-4  ${playingPlaylist ? "block" : "hidden"} h-auto`}>
            <PlayingPlaylistComp playlist={playlist} videoId={videoId} />
          </div>

          {/* Description */}
          <div className="bg-[#121212] mt-3 flex flex-col lg:max-w-[748px] w-full max-w-[100vw] box-border">
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
                          {videoDetails.channel.subscribersCount} subscribers
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
                    <div
                      onClick={handleLike}
                      className="w-[80px] h-[36px] rounded-3xl flex flex-row justify-evenly hover:bg-[#635f5f] px-3 text-sm items-center bg-[#2e302f] box-border"
                    >
                      {isLiked ? (
                        <>
                          <ThumbUpAltIcon />{" "}
                        </>
                      ) : (
                        <>
                          <ThumbUpOffAltIcon />
                        </>
                      )}{" "}
                      {likes}
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

          {/* play next for small screens */}
          <div className="lg:hidden flex flex-col  w-full pt-3 h-auto box-border">
            {/* Right side content */}

            {watchNext?.map((video, index) => {
              return (
                <div key={index} onClick={() => navigateToVideo(video._id)}>
                  <LongVideoCard
                    remove={"Remove from Watch histor"}
                    video={video}
                  />
                </div>
              );
            })}
          </div>
          <div className="py-4" >
            <button hidden={!watchNextHasMore} className="w-[100%] h-10 rounded-full border-gray-500 border-2 text-blue-400" onClick={getWatchNext}>Show more</button>
          </div>

          {/* comments */}
          {videoDetails.canComment ? (
            <Comments videoDetails={videoDetails} setVideoDetails={setVideoDetails} loggedIn={loggedIn} />
          ) : (
            <div className="flex mx-auto mt-4">
              Comments are disabled for this video
            </div>
          )}
        </div>

        {/* Right Side */}
        <div className={`hidden lg:flex flex-col lg:w-[35%] pt-3 w-full h-auto box-border lg:mx-6`}>
          {/* Right side content */}
          {/* {console.log(watchNext)} */}
          <div className={`border-2 rounded-2xl border-gray-500 flex flex-col w-full max-h-[500px] mb-4  ${playingPlaylist ? "block" : "hidden"} h-auto`}>
            <PlayingPlaylistComp playlist={playlist} playingVideoId={videoId} />
          </div>
          {watchNext?.map((video, index) => {
            // console.log(video)
            return (
              <div key={index} onClick={() => navigateToVideo(video._id)} ref={index === watchNext.length - 1 ? lastElementRef : null}>
                <LongVideoCard
                  remove={"Remove from Watch histor"}
                  video={video}
                />
              </div>

            );
          })}
        </div>
      </div>


    </>
  );
};

export default VideoPlayer;
