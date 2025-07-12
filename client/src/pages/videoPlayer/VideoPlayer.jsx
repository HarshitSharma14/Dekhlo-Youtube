import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Plyr from "plyr";
import "plyr/dist/plyr.css";
import { PiShareFatLight } from "react-icons/pi";
import axios from "axios";
import {
  GET_COMMENTS,
  GET_PLAYLIST_VIDEOS,
  GET_VIDEO,
  GET_WATCH_NEXT,
  LIKE_UNLIKE,
  PUT_COMMENT,
  SUBSCRIBE_CHANNEL,
  UNSUBSCRIBE_CHANNEL,
} from "../../utils/constants";
import RepeatIcon from "@mui/icons-material/Repeat";
import CloseIcon from "@mui/icons-material/Close";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import { BsThreeDots } from "react-icons/bs";
import Description from "../../component/Description";
import { BsThreeDotsVertical } from "react-icons/bs";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ShuffleIcon from "@mui/icons-material/Shuffle";
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
import PlayingPlaylistComp from "../../component/PlayingPlaylistComp";
import { useNavigate } from "react-router-dom";
import { Global } from "@emotion/react";
import { styled } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { grey } from "@mui/material/colors";
// import Button from '@mui/material/Button';
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import { ButtonForCreatorSupport } from "../channel/ChannelLayout";
import { MoreIconButton } from "../../component/cards/VideoCard";

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
  const [watchNext, setWatchNext] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [watchNextLoading, setWatchNextLoading] = useState(false);
  const [watchNextHasMore, setWatchNextHasMore] = useState(true);
  const lastElementRef = useRef(null);
  const [playingPlaylist, setPlayingPlaylist] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const plyrInstance = useRef(null); // Ref for Plyr instance
  const [copied, setCopied] = useState(false);

  const [searchParams] = useSearchParams();
  const queryValue = searchParams.get("playlist"); // Get query param 'q'
  const playlistId = queryValue;
  const [subscribed, setSubscribed] = useState(false);
  const [bell, setBell] = useState(false);
  const [loading, setLoading] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const openSubscribeMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const closeSubscribeMenu = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const handlePopState = () => {
      window.location.reload(); // 🔥 Reload on back/forward navigation
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // getting video data
  useEffect(() => {
    const getVideoData = async () => {
      try {
        const response = await axios.get(`${GET_VIDEO}/${videoId}`, {
          withCredentials: true,
        });
        console.log(response.data);
        // setLoggedIn(response.data.loggedIn);
        setLoggedIn(channelInfo != undefined && channelInfo != null);
        setLikes(response.data.video.likes);

        setSubscribed(response.data.isSubscribed);
        setBell(response.data.isBell);

        setIsLiked(response.data.isLiked);
        setVideoDetails(response.data.video);
        // console.log(channelInfo)
      } catch (error) {
        toast.error("Error fetching video data");
        navigate("/");
        console.error("Error fetching video data:", error);
      }
    };
    getVideoData();
  }, [videoId]);

  useEffect(() => {
    if (queryValue) {
      console.log("playlist", queryValue);

      setPlayingPlaylist(true);

      const getPlaylistVideos = async () => {
        try {
          const response = await axios.get(
            `${GET_PLAYLIST_VIDEOS}?playlistId=${playlistId}`,
            { withCredentials: true }
          );
          console.log(response.data);
          if (
            response.data.playlist.videos.some((video) => video._id === videoId)
          ) {
            setPlaylist(response.data.playlist);
          } else {
            navigate(`/video-player/${videoId}`);
            setTimeout(() => {
              navigate(0); // Force page reload (not recommended but works)
            }, 0);
          }
        } catch (error) {
          console.error("Error fetching video data:", error);
          toast.error("Not a valid playlist");
          setPlayingPlaylist(false);
          navigate(`/video-player/${videoId}`);
        }
      };

      getPlaylistVideos();
    }
  }, [queryValue, playlistId]);

  const toggleBell = async () => { };

  // use effects
  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2s
    } catch (err) {
      toast.error("Failed to copy link");
      console.error("Failed to copy:", err);
    }
  };

  const getWatchNext = async () => {
    if (watchNextLoading || !watchNextHasMore) return;

    setWatchNextLoading(true);
    console.log('recheck')
    try {
      const response = await axios.get(
        `${GET_WATCH_NEXT}/${videoId}?cursor=${cursor}`
      );
      setWatchNextHasMore(response.data.hasMore);
      setWatchNext((watchNext) => [...watchNext, ...response.data.watchNext]);
      setCursor(
        response.data.nextCursor
      );
      console.log(response.data)
      setWatchNextLoading(false);
    } catch (error) {
      console.error("Error fetching video data:", error);
    }
  };

  useEffect(() => {
    const fetchInitialVideos = async () => {
      const response = await axios.get(`${GET_WATCH_NEXT}/${videoId}`);
      // console.log(res);
      setWatchNextHasMore(response.data.hasMore);
      setWatchNext([...response.data.watchNext]);
      setCursor(
        response.data.nextCursor
      );
    };

    fetchInitialVideos(); // Fetch first batch when component mounts
  }, []);

  // Use Intersection Observer to detect when the last item is visible
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        getWatchNext(); // Fetch more data when last item appears
        console.log("innnn");
      }
    });

    if (lastElementRef.current) observer.observe(lastElementRef.current);
    return () => observer.disconnect();
  }, [watchNext]); // Re-run when videos change

  const player = new Plyr(playerRef.current, {
    autoplay: true,
    quality: {
      default: 1080,
      options: [1080, 720, 480],
      forced: true,
      onend: true,
    },
    settings: ["quality", "speed"],
    fullscreen: {
      enabled: true,
      fallback: true, // Ensures a fallback for unsupported browsers
      iosNative: true,
    },
  });

  const subscribeToggle = async () => {
    if (loading) return;

    console.log("inside subs");

    setLoading(true);

    if (!subscribed) {
      const toastId = toast.loading("Subscribing...");
      try {
        const response = await axios.post(
          SUBSCRIBE_CHANNEL,
          { creatorId: videoDetails.channel._id },
          { withCredentials: true }
        );
        console.log(response);
        setSubscribed(true);
        setBell(true);
        videoDetails.channel.subscribersCount += 1;
        toast.success(`${videoDetails.channel.channelName}+' subscribed'`, {
          id: toastId,
        });
      } catch (error) {
        console.log(error);
        toast.error("Error subscribing", { id: toastId });
      }
    } else {
      const toastId = toast.loading("Unsubscribing...");
      try {
        const response = await axios.delete(UNSUBSCRIBE_CHANNEL, {
          data: { creatorId: videoDetails.channel._id },
          withCredentials: true,
        });
        console.log(response);
        closeSubscribeMenu();
        setSubscribed(false);
        setBell(false);
        videoDetails.channel.subscribersCount -= 1;
        toast.success(`${videoDetails.channel.channelName}+' unsubscribed'`, {
          id: toastId,
        });
      } catch (error) {
        console.log(error);
        toast.error("Error unsubscribing", { id: toastId });
      }
    }

    setLoading(false);
  };

  const navigateToVideo = (videoIdNew) => {
    console.log("navingatinggggggggggggggggggggg");
    navigate(`/video-player/${videoIdNew}`);
    setTimeout(() => {
      navigate(0); // Force page reload (not recommended but works)
    }, 0);
    return;
  };

  useEffect(() => {
    if (playerRef.current && videoDetails.videoUrl) {
      // Initialize Plyr
      plyrInstance.current = new Plyr(playerRef.current, {
        autoplay: true,
        controls: [
          "play-large", // Large play button in the center
          "rewind", // Rewind button
          "fast-forward", // Fast forward button
          "play",
          "progress",
          "current-time",
          "duration",
          "mute",
          "volume",
          "settings",
          "pip", // Picture-in-picture mode
          "airplay", // Airplay for Apple devices
          "fullscreen",
        ],
        settings: ["speed"],
        fullscreen: { enabled: true, fallback: true, iosNative: true },
        loop: { active: false },
        keyboard: { focused: true, global: false },
        autopause: true,
        hideControls: true,
        seekTime: 10,
      });

      const videoElement = playerRef.current.querySelector("video");
      if (videoElement) {
        videoElement.classList.add("w-full", "h-full", "object-cover");
      }

      return () => {
        // Destroy Plyr instance on unmount
        plyrInstance.current?.destroy();
      };
    }
  }, [videoDetails.videoUrl]);

  // useEffect(() => {
  //     if (playerRef.current && videoDetails.videoUrl) {

  // functions

  // const openDiscription = () => { };

  //         return () => {
  //             player.destroy();  // Clean up when the component is unmounted
  //         };
  //     }
  // }, [videoDetails]);  // Re-run when videoDetails change

  // functions

  const handleLike = async () => {
    if (loading) return;

    setLoading(true);
    console.log(loggedIn);
    if (!loggedIn) {
      toast.error("Please login to like the video");
      setLoading(false);
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

    setLoading(false);
  };

  dayjs.extend(relativeTime);
  const formatTimeAgo = (date) => {
    return dayjs(date).fromNow();
  };
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <div
        style={{
          paddingLeft: screenWidth > 500 ? "clamp(0.1rem, 5vw, 8.25rem)" : "0",
          paddingRight: screenWidth > 500 ? "clamp(0.1rem, 5vw, 8.25rem)" : "0",
          transition: "padding 0.3s ease",
        }}
        className="bg-[#121212] flex flex-col lg:flex-row w-full h-full mx-auto  box-border overflow-x-hidden"
      >
        {/* Left Side */}
        <div className="flex flex-col w-full h-auto max-w-full lg:w-[65%] box-border">
          {/* Video Player */}
          <div className="w-full flex justify-center box-border">
            {videoDetails.videoUrl ? (
              <video
                className="plyr-video w-full h-full max-h-[100vh] object-contain rounded-2xl"
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

          <div
            className={`border-2 lg:hidden rounded-2xl border-gray-500 flex flex-col w-full max-h-[500px] mb-4  ${playingPlaylist ? "block" : "hidden"
              } h-auto`}
          >
            <PlayingPlaylistComp playlist={playlist} videoId={videoId} />
          </div>

          {/* Description */}
          <div className="bg-[#121212] mt-3 flex flex-col  w-full max-w-[100vw] box-border">
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

                      <div
                        className={`h-[36px] mr-2  w-auto rounded-3xl overflow-hidden text-sm flex-none flex ml-auto items-center box-border`}
                      >
                        <ButtonForCreatorSupport
                          button={1}
                          isSubscribedInitially={subscribed}
                          config={{
                            justifyContent: "space-around",
                            m: "0px",
                            fontSize: "12px",

                            "@media (max-width: 714px)": {
                              display: "flex",
                            },
                          }}
                          isBellInitially={bell}
                          channelId={videoDetails.channel._id}
                        />
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
                      <PiShareFatLight onClick={share} />
                    </div>

                    <div className={`w-[40px] relative h-[36px] rounded-3xl flex flex-row justify-evenly hover:bg-[#635f5f] ml-3 items-center bg-[#2e302f] box-border overflow-hidden ${channelInfo ? "" : "hidden"}`}>
                      {/* <BsThreeDots /> */}
                      <MoreIconButton
                        isInView={true}
                        channelInfo={channelInfo}
                        videoId={videoDetails._id}
                      />
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
          <div className="lg:hidden flex flex-col w-full overflow-x-hidden  pt-3 h-auto">
            {/* Right side content */}

            {watchNext?.map((video, index) => {
              return (
                <div
                  className="overflow-x-hidden w-auto  "
                  key={index}
                  onClick={() => navigateToVideo(video._id)}
                >
                  <LongVideoCard video={video} />
                </div>
              );
            })}
          </div>
          <div className="py-4">
            <button
              hidden={!watchNextHasMore}
              className={`lg:hidden w-[100%] h-10 rounded-full border-gray-500 border-2 text-blue-400`}
              onClick={getWatchNext}
            >
              Show more
            </button>
          </div>

          {/* comments */}
          {videoDetails.canComment ? (
            <Comments
              videoDetails={videoDetails}
              setVideoDetails={setVideoDetails}
              loggedIn={loggedIn}
            />
          ) : (
            <div className="flex mx-auto mt-4">
              Comments are disabled for this video
            </div>
          )}
        </div>

        {/* Right Side */}
        <div
          className={`hidden lg:flex flex-col lg:w-[35%] pt-3 w-full h-auto box-border lg:mx-6`}
        >
          {/* Right side content */}
          {/* {console.log(watchNext)} */}
          <div
            className={`border-2 rounded-2xl border-gray-500 flex flex-col w-full max-h-[500px] mb-4  ${playingPlaylist ? "block" : "hidden"
              } h-auto`}
          >
            <PlayingPlaylistComp playlist={playlist} playingVideoId={videoId} />
          </div>
          {watchNext?.map((video, index) => {
            // console.log(video)
            return (
              <div
                key={index}
                onClick={() => navigateToVideo(video._id)}
                ref={index === watchNext.length - 1 ? lastElementRef : null}
              >
                <LongVideoCard video={video} />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default VideoPlayer;
