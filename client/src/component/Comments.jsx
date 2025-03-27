import { useState } from 'react';
import { TextField } from '@mui/material'
import React from 'react'
import toast from 'react-hot-toast';
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { GET_COMMENTS, PUT_COMMENT } from '../utils/constants';
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useEffect } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';
import { useAppStore } from '../store';
import dayjs from 'dayjs';
import relativeTime from "dayjs/plugin/relativeTime";
import { useInView } from 'react-intersection-observer';
import { SwipeableDrawer, List, ListItem, ListItemText } from "@mui/material";
import { Global } from '@emotion/react';
import { styled } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { grey } from '@mui/material/colors';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { useRef } from 'react';
import { formatViews } from './Description';
import ClearIcon from '@mui/icons-material/Clear';

const Comments = ({ videoDetails, setVideoDetails, loggedIn }) => {
    const { channelInfo } = useAppStore();



    const [open, setOpen] = useState(false);
    const toggleDrawer = (state) => (event) => {
        if (event && event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) return;
        setOpen(state);
    };

    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const openBool = Boolean(anchorEl);

    const videoId = videoDetails._id;

    const lastCommentRef = useRef(null);
    const lastCommentRefBig = useRef(null);


    const putComment = async () => {
        const toastId = toast.loading("Commenting...");

        console.log(commentText);
        if (commentText.length === 0) {
            return;
        }
        if (!loggedIn) {
            toast.error("Login to comment on videos.", { id: toastId });
            return;
        }
        try {
            const response = await axios.post(
                `${PUT_COMMENT}/${videoId}`,
                { text: commentText },
                { withCredentials: true }
            );
            toast.success("Comment added successfully", { id: toastId });
            setVideoDetails((prevDetails) => ({
                ...prevDetails, commentCount: prevDetails.commentCount + 1,
            }));

            setComments((prevComments) => [response.data.comment, ...prevComments]);
            setSkip(skip + 1);
            console.log(response.data);
            setCommentText("");
        } catch (error) {
            console.error("Error posting comment:", error);
        }
    };


    const fetchComments = async () => {
        const response = await axios.get(
            `${GET_COMMENTS}/${videoId}?limit=2&skip=0`
        );
        console.log(response);
        setComments(response.data.comments);
        setHasMore(response.data.hasMore);
    };
    useEffect(() => {
        fetchComments();
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                loadMoreComments(); // Fetch more data when last item appears
                console.log('innnn')
            }
        });

        if (lastCommentRef.current) observer.observe(lastCommentRef.current);
        return () => observer.disconnect();
    }, [comments]); // Re-run when videos change

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                loadMoreComments(); // Fetch more data when last item appears
                console.log('innnn')
            }
        });

        if (lastCommentRefBig.current) observer.observe(lastCommentRefBig.current);
        return () => observer.disconnect();
    }, [comments]); // Re-run when videos change



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


    const handleCommentMenuClick = (event) => setAnchorEl(event.currentTarget);
    const handleCommentMenuClose = () => setAnchorEl(null);

    dayjs.extend(relativeTime);
    const formatTimeAgo = (date) => {
        return dayjs(date).fromNow();
    };
    const Root = styled('div')(({ theme }) => ({
        height: '100%',
        backgroundColor: "#121212",
        ...theme.applyStyles('dark', {
            backgroundColor: theme.palette.background.default,
        }),
    }));

    const StyledBox = styled(Box)(({ theme }) => ({
        backgroundColor: "#121212",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: "12px 16px",
        boxShadow: "0px -2px 10px rgba(0,0,0,0.1)",
    }));
    const Puller = styled("div")(({ theme }) => ({
        width: 40,
        height: 6,
        backgroundColor: "#121212",
        borderRadius: 3,
        position: "absolute",
        top: 8,
        left: "50%",
        transform: "translateX(-50%)",
    }));

    const drawerBleeding = 56;

    return (
        <>
            <div className="w-full hidden lg:block  h-auto max-w-[100vw] overflow-hidden box-border">
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
                                            className={`mr-1 rounded-3xl px-3 py-1 bg-blue-500  text-black font-roboto ${commentText.length === 0
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
                            {comments.map((comment, index) => {
                                // console.log("in comment map", comments.length);
                                return (
                                    <div className="flex flex-row my-5" key={comment?._id} ref={index === comments.length - 1 ? lastCommentRefBig : null}>
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
                                            className={`${comment?.channel._id === channelInfo?._id ||
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
                                                open={openBool}
                                                onClose={handleCommentMenuClose}
                                                MenuListProps={{
                                                    "aria-labelledby": "basic-button",
                                                }}
                                            >
                                                <MenuItem
                                                    className={`${comment?.channel._id === channelInfo?._id
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

            <div className="lg:hidden flex flex-col items-center bg-[#121212]">
                {/* <Button variant="contained" onClick={toggleDrawer(true)}>Open Comments</Button> */}
                <div onClick={toggleDrawer(true)} className="bg-[#292828] cursor-pointer w-full mt-1 font-roboto font-semibold rounded-xl min-h-[80px] flex flex-col px-3 py-3">
                    <div> Comments {formatViews(videoDetails.commentCount)}</div>
                    <div className='flex flex-row h-[42px] relative overflow-hidden w-[82vw]'>
                        <div className='absolute top-0 left-0 w-[40px] h-[40px] flex items-center mr-2'><img className="rounded-full w-[40px] h-[40px] " src={comments[0]?.channel?.profilePhoto} /></div>
                        <div className='truncate overflow-hidden  pl-[45px] '>{comments[0]?.commentData}</div>
                    </div>
                </div>
                <SwipeableDrawer
                    anchor="bottom"
                    open={open}
                    onClose={toggleDrawer(false)}
                    onOpen={toggleDrawer(true)}
                    disableSwipeToOpen={false}
                    keepMounted
                    sx={{
                        zIndex: 1300,
                        "& .MuiDrawer-paper": {
                            height: "auto", // Adjust height as needed
                            maxHeight: "90vh",
                        },
                    }}
                >
                    <StyledBox
                        sx={{
                            position: 'absolute',
                            top: -drawerBleeding,
                            borderTopLeftRadius: 8,
                            borderTopRightRadius: 8,
                            visibility: 'visible',
                            right: 0,
                            left: 0,
                        }}
                    >
                        <Puller />
                        <Typography variant="h6" sx={{ textAlign: "center", marginBottom: 1 }}>
                            Comments
                        </Typography>
                    </StyledBox>

                    <div className="flex flex-col w-full h-auto max-w-[100vw] mt-4 overflow-hidden box-border">
                        <div className='flex flex-row justify-between'>
                            <div className="pl-3 font-roboto font-bold text-lg pb-3 border-b-2 border-[#7b7e8344]">
                                {videoDetails.commentCount} Comments
                            </div>
                            <div className='m-2 cursor-pointer'>
                                <ClearIcon onClick={toggleDrawer(false)} />
                            </div>
                        </div>
                        <div className="flex flex-row mt-5 border-b-2 border-[#7b7e8344]">
                            <div className="rounded-full h-[50px] w-[50px]">
                                <img
                                    className="object-contain w-full h-full rounded-full"
                                    src={videoDetails.channel?.profilePhoto}
                                />
                            </div>
                            <div className="flex ml-3 w-full flex-col bor">
                                <div>
                                    <TextField
                                        id="outlined-basic"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        variant="outlined"
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
                                            className={`mr-1 rounded-3xl px-3 py-1 bg-blue-500  text-black font-roboto ${commentText.length === 0
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
                        <div className="overflow-y-auto">
                            {comments.map((comment, index) => {
                                // console.log("in comment map", comments.length);
                                return (
                                    <div className="flex flex-row my-5" key={comment?._id} ref={index === comments.length - 1 ? lastCommentRef : null}>
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
                                            className={`${comment?.channel._id === channelInfo?._id ||
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
                                                open={openBool}
                                                onClose={handleCommentMenuClose}
                                                MenuListProps={{
                                                    "aria-labelledby": "basic-button",
                                                }}
                                            >
                                                <MenuItem
                                                    className={`${comment?.channel._id === channelInfo?._id
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
                </SwipeableDrawer>
            </div>
        </>
    )
}

export default Comments