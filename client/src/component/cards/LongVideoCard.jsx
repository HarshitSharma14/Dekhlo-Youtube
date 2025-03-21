import { MoreVert } from "@mui/icons-material";
import {
  Avatar,
  Box,
  CardMedia,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useRef, useState } from "react";
import { MoreIconButton } from "./VideoCard";
import { useAppStore } from "../../store";
import { formatUploadTime } from "../../utils/helper";
const image =
  "https://images.pexels.com/photos/30426849/pexels-photo-30426849/free-photo-of-urban-black-and-white-bicycle-scene.jpeg?auto=compress&cs=tinysrgb&w=400&lazy=load";
const videoUrl =
  "https://static.videezy.com/system/resources/previews/000/006/997/original/MR8_8189.mp4";
const LongVideoCard = ({ video }) => {
  const boxRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const videoRef = useRef(null);
  const { channelInfo } = useAppStore();

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };
  const [timeleft, setTimeleft] = useState(formatTime(video?.duration));

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };
  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setTimeleft(formatTime(video?.duration));
  };
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progressValue =
        (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progressValue);
      const video = videoRef.current;
      const timeRemaining = video.duration - video.currentTime;
      setTimeleft(formatTime(timeRemaining));
    }
  };
  const [height, setHeight] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [hovered, setHovered] = useState(false);

  const [progress, setProgress] = useState(0);
  // Seek when clicking on progress bar

  return (
    <Box
      sx={{
        display: "flex",
        mb: "15px",
        padding: "0 6px",
        position: "relative",
        cursor: "pointer",
      }}
      onMouseEnter={() => {
        if (boxRef.current) {
          setHeight(boxRef.current.getBoundingClientRect().height);
          if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
          setIsInView(true);
        }
      }}
      onMouseLeave={() => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setIsInView(false);
        setHovered(false);
        handleMouseLeave();
      }}
    >
      <Box
        ref={boxRef}
        sx={{
          flex: "5",
          maxWidth: "400px",
          minWidth: "180px",
          position: "relative",
          height: "auto",
          borderRadius: hovered ? "0" : "12px",
          overflow: "hidden",
          transition: "border-radius 0.3s ease-in-out",
          "@media (max-width:560px)": {
            borderRadius: 0,
          },
        }}
      >
        <CardMedia
          component="img"
          image={video?.thumbnailUrl}
          alt="Thumbnail"
          sx={{
            display: hovered && "none",
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        {isInView && (
          <CardMedia
            ref={videoRef}
            onCanPlay={() => {
              hoverTimeoutRef.current = setTimeout(() => {
                setHovered(true);
                handleMouseEnter();
              }, 700);
            }}
            loop={true}
            onTimeUpdate={handleTimeUpdate}
            component="video"
            src={video?.videoUrl}
            sx={{
              display: !hovered && "none",
              objectFit: "cover",
              height: height,
            }}
          />
        )}
        {/* Progress bar ********************************* */}

        <Box
          sx={{
            bgcolor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            position: "absolute",
            right: "8px",
            bottom: "8px",
            fontSize: "12px",
            padding: "4px 8px",
            borderRadius: "5px",
            fontWeight: "bold",
          }}
        >
          {timeleft.length ? timeleft : "22:44"}
        </Box>
      </Box>
      <Box
        sx={{
          flex: "7",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <Typography
          sx={{
            // bgcolor: "yellow",
            width: "95%",
            padding: "2px 10px",
            fontSize: "20px",
            wordBreak: "break-word",
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            "@media (max-width:530px)": {
              fontSize: "16px",
              width: "90%",
            },
          }}
        >
          {video.title}
        </Typography>
        <Typography
          sx={{
            padding: "2px 10px",
            fontSize: "12px",
            color: "#b1b1b1",
            marginTop: "-3px",
            "@media (max-width:530px)": {
              fontSize: "10px",
            },
          }}
        >
          {/* {video.views} views  {formatUploadTime(video?.createdAt)} */}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Avatar
            src={video.channel?.profilePhoto}
            sx={{
              width: "25px",
              height: "25px",
              marginLeft: "10px",
            }}
          />
          <Typography
            sx={{
              padding: "2px 10px",
              fontSize: "12px",
              color: "#b1b1b1",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              "@media (max-width:530px)": {
                fontSize: "10px",
              },
            }}
          >

            {video.channel?.channelName}
          </Typography>
        </Box>
        <Typography
          sx={{
            padding: "2px 10px",
            fontSize: "12px",
            color: "#b1b1b1",
            wordBreak: "break-word",
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            "@media (max-width:530px)": {
              display: "none",
            },
          }}
        >
          {/* {video?.description} */}
        </Typography>
      </Box >

      <MoreIconButton
        removeFrom="Remove from Watch history"
        isInView={isInView}
        channelInfo={channelInfo}
        videoId={video._id}
      />
    </Box >
  );
};

export default LongVideoCard;
