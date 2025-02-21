import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Plyr from "plyr";
import "plyr/dist/plyr.css";
import { PiShareFatLight } from "react-icons/pi";
import axios from "axios";
import {
  GET_COMMENTS,
  GET_PLAY_NEXT,
  GET_VIDEO,
  LIKE_UNLIKE,
  PUT_COMMENT,
} from "../../utils/constants";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import { BsThreeDots } from "react-icons/bs";
import Description from "../../component/Description";
import WatchNext from "../../component/WatchNext";
import { BsThreeDotsVertical } from "react-icons/bs";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
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

const VideoPlayer = () => {
  const { channelInfo } = useAppStore();

  // states and refs
  const { videoId } = useParams();
  const [videoDetails, setVideoDetails] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const playerRef = useRef(null); // Reference to the video element
  const [loggedIn, setLoggedIn] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [commentText, setCommentText] = useState("");

  const putComment = async () => {
    const toastId = toast.loading("Logging in...");

    console.log(commentText);
    if (commentText.length === 0) {
      return;
    }
    if (!loggedIn) {
      toast.error("Login to comment on videos.");
      return;
    }
    try {
      const response = await axios.post(
        `${PUT_COMMENT}/${videoId}`,
        { text: commentText },
        { withCredentials: true }
      );
      toast.success("Comment added successfully", { id: toastId });
      setComments((prevComments) => [response.data.comment, ...prevComments]);
      setSkip(skip + 1);
      console.log(response.data);
      setCommentText("");
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  // use effects

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
  }, []);

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

  // getting comments first time
  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    const response = await axios.get(
      `${GET_COMMENTS}/${videoId}?limit=2&skip=0`
    );
    console.log(response);
    setComments(response.data.comments);
    setHasMore(response.data.hasMore);
  };

  // getting coments after scrolling

  useEffect(() => {
    const handleScroll = debounce(() => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 10
      ) {
        console.log("init 1");
        if (hasMore) {
          loadMoreComments();
        }
      }
    }, 1000); // Debounce by 300ms

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [skip, hasMore, comments]);

  const loadMoreComments = async () => {
    const newSkip = skip + 2;
    console.log("init 2");
    const response = await axios.get(
      `${GET_COMMENTS}/${videoId}?limit=2&skip=${newSkip}`
    );
    console.log(response);
    console.log("init 3");
    if (response.data.comments?.length > 0) {
      console.log("yes len is more");
      setComments((prevComments) => {
        console.log("in cnt", response.data.comments.length);
        return [...prevComments, ...response.data.comments];
      });
      setSkip(newSkip);
    }
    setHasMore(response.data.hasMore ?? false); // Default to false if undefined

    console.log(comments);
    console.log(response.data.hasMore);
    console.log(newSkip);
  };

  useEffect(() => {
    const getPlayNext = async () => {
      try {
        const response = await axios.get(`${GET_PLAY_NEXT}/${videoId}`);
      } catch (error) {
        console.error("Error fetching video data:", error);
      }
    };
  }, []);

  const handleCommentMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleCommentMenuClose = () => setAnchorEl(null);

  // useEffect(() => {
  //     if (playerRef.current && videoDetails.videoUrl) {

  // functions

  const openDiscription = () => {};

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
        <div className="flex flex-col w-full h-auto max-w-full lg:w-[60%] box-border">
          {/* Video Player */}
          <div className="w-full flex justify-center box-border">
            {videoDetails.videoUrl ? (
              <video
                className="w-full h-auto max-h-[70vh] lg:max-h-[60vh] object-contain rounded-2xl"
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
          <div className="lg:hidden flex flex-col  w-full bg-red-500 h-[1000px] box-border">
            {/* Right side content */}
            <WatchNext />
          </div>

          {/* comments */}
          {videoDetails.canComment ? (
            <div className="w-full  h-auto max-w-[100vw] overflow-hidden box-border">
              {videoDetails && comments ? (
                <div className="flex flex-col w-full h-auto max-w-[100vw] mt-4 overflow-hidden box-border">
                  <div className="pl-3 font-roboto font-bold text-lg">
                    {videoDetails.commentCount} Comments
                  </div>
                  <div className="flex flex-row mt-5">
                    <div className="rounded-full h-[50px] w-[50px]">
                      <img
                        className="object-contain w-full h-full rounded-full"
                        src={videoDetails.channel?.profilePhoto}
                      />
                    </div>
                    <div className="flex ml-3 w-full flex-col">
                      <div>
                        <TextField
                          id="standard-basic"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          variant="standard"
                          multiline
                          className="w-full"
                        />
                      </div>
                      <div className="flex flex-row h-[50px] items-center justify-between">
                        <MdOutlineEmojiEmotions className="h-[30px] w-[30px]" />
                        <div className="flex flex-row">
                          <div className="rounded-3xl px-3 py-1 hover:bg-slate-600 mr-3 cursor-pointer ">
                            Cancel
                          </div>
                          <div
                            onClick={putComment}
                            className={`mr-1 rounded-3xl px-3 py-1 bg-blue-500  text-black font-roboto ${
                              commentText.length === 0
                                ? "disabled bg-slate-400"
                                : "hover:bg-blue-300"
                            } font-semibold cursor-pointer`}
                          >
                            Comment
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-hidden">
                    {comments.map((comment) => {
                      console.log("in comment map", comments.length);
                      return (
                        <div className="flex flex-row my-5" key={comment?._id}>
                          <div className="flex w-[40px] h-[40px] rounded-full mr-2">
                            <img
                              className="w-full h-auto rounded-full"
                              src={comment?.channel.profilePhoto}
                            />
                          </div>
                          <div className="flex-1 ml-2 flex-col">
                            <div className="font-semibold overflow-hidden w-full">
                              {comment?.channel.channelName}
                              <span className="font-normal text-sm text-gray-500 ml-2">
                                {formatTimeAgo(comment?.createdAt)}
                              </span>
                            </div>
                            <div className="break-all w-full whitespace-pre-wrap">
                              {comment?.commentData}
                            </div>
                          </div>
                          <div
                            className={`${
                              comment?.channel._id === channelInfo?._id ||
                              videoDetails.channel._id === channelInfo?._id
                                ? "block"
                                : "hidden"
                            }`}
                          >
                            <BsThreeDotsVertical
                              className="mt-2 ml-2"
                              onClick={handleCommentMenuClick}
                            />
                            <Menu
                              id="basic-menu"
                              anchorEl={anchorEl}
                              open={open}
                              onClose={handleCommentMenuClose}
                              MenuListProps={{
                                "aria-labelledby": "basic-button",
                              }}
                            >
                              <MenuItem
                                className={`${
                                  comment?.channel._id === channelInfo?._id
                                    ? "block"
                                    : "hidden"
                                }`}
                                onClick={handleCommentMenuClose}
                              >
                                Edit
                              </MenuItem>
                              <MenuItem onClick={handleCommentMenuClose}>
                                Delete
                              </MenuItem>
                            </Menu>
                          </div>
                        </div>
                      );
                    })}
                    {hasMore && <p>Loading more comments...</p>}
                  </div>
                </div>
              ) : (
                <p>Loading comments...</p>
              )}
            </div>
          ) : (
            <div className="flex mx-auto mt-4">
              Comments are disabled for this video
            </div>
          )}
        </div>

        {/* Right Side */}
        <div className="hidden lg:flex flex-col lg:w-[40%] w-full bg-blue-900 h-[1000px] box-border lg:mx-6">
          {/* Right side content */}
          <WatchNext />
        </div>
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

      {/* Right Side */}
      <div className="hidden lg:flex flex-col w-[40%] bg-white h-auto box-border lg:mx-6">
        {/* Right side content */}
        <WatchNext />
      </div>
    </>
  );
};

export default VideoPlayer;
