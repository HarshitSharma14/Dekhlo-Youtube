import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { PiShareFatLight } from "react-icons/pi";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Comments from "../../component/Comments";
import Description from "../../component/Description";
import PlayingPlaylistComp from "../../component/PlayingPlaylistComp";
import LongVideoCard from "../../component/cards/LongVideoCard";
import { useAppStore } from "../../store";
import api from "../../utils/api.js";
import {
  GET_PLAYLIST_VIDEOS,
  GET_VIDEO,
  GET_WATCH_NEXT,
  LIKE_UNLIKE,
} from "../../utils/constants";
// import Button from '@mui/material/Button';
import { MoreIconButton } from "../../component/cards/VideoCard";
import { ButtonForCreatorSupport } from "../channel/ChannelLayout";

const VideoPlayer = () => {
  const { channelInfo } = useAppStore();

  // Simple video player setup - no custom styling

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
  const [playlist, setPlaylist] = useState({});
  const [copied, setCopied] = useState(false);

  const [searchParams] = useSearchParams();
  const queryValue = searchParams.get("playlist"); // Get query param 'q'
  const playlistId = queryValue;
  const [subscribed, setSubscribed] = useState(false);
  const [bell, setBell] = useState(false);
  const [loading, setLoading] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);

  // getting video data
  useEffect(() => {
    console.log("videoId", videoId);

    // Reset video player state when videoId changes
    setVideoDetails({});
    setLikes(0);
    setIsLiked(false);
    setSubscribed(false);
    setBell(false);
    setWatchNext([]);
    setCursor(null);
    setWatchNextHasMore(true);
    setPlayingPlaylist(false);
    setPlaylist({});

    const getVideoData = async () => {
      try {
        const response = await api.get(`${GET_VIDEO}/${videoId}`);
        setLoggedIn(() => channelInfo != undefined && channelInfo != null);
        setLikes(() => response.data.video.likes);

        setSubscribed(() => response.data.isSubscribed);
        setBell(() => response.data.isBell);

        setIsLiked(() => response.data.isLiked);
        setVideoDetails(() => response.data.video);
      } catch (error) {
        toast.error("Error fetching video data");
        navigate("/");
        console.error("Error fetching video data:", error);
      }
    };
    getVideoData();
  }, [videoId, navigate, channelInfo]);

  // Listen for browser navigation events
  useEffect(() => {
    const handlePopState = () => {
      // Force a re-render when browser navigation occurs
      const currentVideoId = window.location.pathname.split("/").pop();
      if (currentVideoId && currentVideoId !== videoId) {
        // The URL has changed but the component hasn't re-rendered yet
        // Force a re-render by updating the state
        setVideoDetails({});
        setWatchNext([]);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [videoId]);

  useEffect(() => {
    if (queryValue) {
      setPlayingPlaylist(true);
      const getPlaylistInfo = async () => {
        try {
          const response = await api.get(
            `${GET_PLAYLIST_VIDEOS}?playlistId=${playlistId}`
          );
          console.log("response", response.data);
          if (response.data?.videos?.some((video) => video._id === videoId)) {
            setPlaylist(response.data.playlist);
          } else {
            navigate(`/video-player/${videoId}`);
          }
        } catch (error) {
          console.error("Error fetching playlist data:", error);
          toast.error("Not a valid playlist");
          setPlayingPlaylist(false);
          navigate(`/video-player/${videoId}`);
        }
      };

      if (playlistId) {
        console.log("calling playlist ", playlistId);
        getPlaylistInfo();
      }
    }
  }, [queryValue, playlistId, videoId, navigate]);

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
    try {
      const response = await api.get(
        `${GET_WATCH_NEXT}/${videoId}?cursor=${cursor}`
      );
      setWatchNextHasMore(response.data.hasMore);
      setWatchNext((watchNext) => [...watchNext, ...response.data.watchNext]);
      setCursor(response.data.nextCursor);
      setWatchNextLoading(false);
    } catch (error) {
      console.error("Error fetching video data:", error);
    }
  };

  useEffect(() => {
    const fetchInitialVideos = async () => {
      try {
        const response = await api.get(`${GET_WATCH_NEXT}/${videoId}`);
        setWatchNextHasMore(response.data.hasMore);
        setWatchNext([...response.data.watchNext]);
        setCursor(response.data.nextCursor);
      } catch (error) {
        console.error("Error fetching watch next videos:", error);
        setWatchNext([]);
        setWatchNextHasMore(false);
      }
    };

    fetchInitialVideos(); // Fetch first batch when videoId changes
  }, [videoId]); // Add videoId as dependency

  // Use Intersection Observer to detect when the last item is visible
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        getWatchNext(); // Fetch more data when last item appears
      }
    });

    if (lastElementRef.current) observer.observe(lastElementRef.current);
    return () => observer.disconnect();
  }, [watchNext, videoId]); // Re-run when videos or videoId changes

  const navigateToVideo = useCallback(
    (videoIdNew) => {
      // Clear current video state before navigating
      setVideoDetails({});
      setWatchNext([]);
      setCursor(null);
      setWatchNextHasMore(true);

      navigate(`/video-player/${videoIdNew}`);
    },
    [navigate]
  );

  // Simple video player setup with keyboard shortcuts

  const handleLike = async () => {
    if (loading) return;

    setLoading(true);
    if (!loggedIn) {
      toast.error("Please login to like the video");
      setLoading(false);
      return;
    }
    try {
      const response = await api.patch(`${LIKE_UNLIKE}/${videoId}`, {
        isLiked: !isLiked,
      });
      setLikes(response.data.likes);
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

  // Reset video element reference when videoId changes
  useEffect(() => {
    if (playerRef.current) {
      // Pause and reset the current video
      playerRef.current.pause();
      playerRef.current.currentTime = 0;
      playerRef.current.load(); // Force reload of video source
    }

    // Also reset the ref to ensure clean state
    if (playerRef.current) {
      playerRef.current = null;
    }
  }, [videoId]);

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
              <div className="w-full max-w-4xl">
                <video
                  key={videoId} // Force re-render when videoId changes
                  ref={playerRef}
                  className="w-full h-auto max-h-[80vh] rounded-lg"
                  controls
                  preload="metadata"
                  poster={videoDetails.thumbnailUrl}
                >
                  <source src={videoDetails.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <div className="w-full max-w-4xl h-64 bg-gray-800 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">Loading video...</p>
              </div>
            )}
          </div>

          {playlistId && (
            <div
              className={`border-2 lg:hidden rounded-2xl border-gray-500 flex flex-col w-full max-h-[500px] mb-4  ${
                playingPlaylist ? "block" : "hidden"
              } h-auto`}
            >
              <PlayingPlaylistComp
                playlist={playlist}
                playingVideoId={videoId}
              />
            </div>
          )}

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

                    <div
                      className={`w-[40px] relative h-[36px] rounded-3xl flex flex-row justify-evenly hover:bg-[#635f5f] ml-3 items-center bg-[#2e302f] box-border overflow-hidden ${
                        channelInfo ? "" : "hidden"
                      }`}
                    >
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
                  <LongVideoCard
                    video={video}
                    showVideoChannelDetails={false}
                  />
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
          {playlistId && (
            <div
              className={`border-2 rounded-2xl border-gray-500 flex flex-col max-h-[500px] w-full  mb-4  ${
                playingPlaylist ? "block" : "hidden"
              } h-auto`}
            >
              <PlayingPlaylistComp
                playlist={playlist}
                playingVideoId={videoId}
                setPlayingPlaylist={setPlayingPlaylist}
              />
            </div>
          )}
          {watchNext?.map((video, index) => {
            return (
              <div
                key={index}
                onClick={() => navigateToVideo(video._id)}
                ref={index === watchNext.length - 1 ? lastElementRef : null}
              >
                <LongVideoCard video={video} showVideoChannelDetails={false} />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default VideoPlayer;
