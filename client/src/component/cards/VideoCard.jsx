import { IconButton, Menu, MenuItem, Tooltip, Typography } from "@mui/material";
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatUploadTime } from "../../utils/helper.js";
import "./VideoCard.css";
import {
  BookmarkAddOutlined,
  EditOutlined,
  MoreVert,
  PlaylistAddOutlined,
  SaveAltOutlined,
  WatchLater,
  WatchLaterOutlined,
} from "@mui/icons-material";
import { useAppStore } from "../../store/index.js";

const VideoCard = ({
  id,
  thumbnail,
  title,
  channelName,
  views,
  uploadTime,
  channelProfile,
  videoUrl,
  channelId,
  isOwner = false,
  isInChannel = false,
}) => {
  // useState *********************************************************************************************
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [anchorEl, setAnchorEl] = React.useState(null);

  // constant ********************************************************************************************
  const open = Boolean(anchorEl);
  const cardRef = useRef(null);
  const videoRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const { channelInfo } = useAppStore();

  // function *********************************************************************************************
  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };
  const handleMenuClose = (e) => {
    e.stopPropagation();
    setAnchorEl(null);
  };

  const handleHover = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progressValue =
        (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progressValue);
    }
  };

  return (
    <div
      ref={cardRef}
      onClick={() => navigate(`/video-player/${id}`)}
      className="video-card"
      style={{
        height: isInChannel ? "270px" : "320px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
      onMouseEnter={() => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setIsInView(true);
      }}
      onMouseLeave={() => {
        // Clear the timeout on mouse leave
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setIsInView(false);
        setIsHovered(false);
        handleMouseLeave();
      }}
    >
      <div
        style={{
          height: "70%",
        }}
        className={`video-card-thumbnail ${
          isHovered ? "thumbnail-transition" : ""
        }`}
      >
        {isInView && (
          <div
            className={`video-container ${isHovered ? "hovered" : ""}`}
            style={{
              position: "relative",
              width: "100%",
            }}
          >
            <video
              ref={videoRef}
              onCanPlay={() => {
                hoverTimeoutRef.current = setTimeout(() => {
                  setIsHovered(true);
                  handleHover();
                }, 300);
              }}
              src={videoUrl} // Start loading the video when in view
              muted={true}
              onTimeUpdate={handleTimeUpdate}
              controls={false}
              loop
              className={`video-preview ${isHovered ? "hovered" : ""}`}
              preload="auto"
              style={{
                width: "100%",
                height: "100%",
                minHeight: "186.425px",
              }}
            ></video>
            {isHovered && (
              <div
                style={{
                  position: "absolute",
                  height: "100%",
                  width: "100%",
                  top: 0,
                  // backgroundColor: "blue",
                }}
              >
                {/* Progress Bar */}
                <div
                  className="progress-bar"
                  style={{
                    width: "100%",
                    height: "3px",
                    backgroundColor: "#7f7f7f",
                    position: "absolute",
                    bottom: "0",
                    zIndex: "1",
                  }}
                >
                  <div
                    className="progress"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: "red",
                      height: "3px",
                      // borderRadius: "20px",
                      position: "absolute",
                      bottom: "0px",
                      zIndex: "4",
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}
        <img
          src={thumbnail}
          alt={title}
          className={`thumbnail ${isHovered ? "hidden" : ""}`}
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      </div>

      <div
        className="video-card-info"
        style={{
          position: "relative",
        }}
      >
        {!isInChannel && (
          <div
            className="video-card-avatar"
            onClick={(e) => {
              e.stopPropagation(); // Prevents the card click event
              navigate(`/channel/${channelId}`);
            }}
          >
            <img
              src={channelProfile}
              alt={channelName}
              className="channel-avatar"
            />
          </div>
        )}
        <div className="video-card-details">
          <h3 className="video-card-title">{title}</h3>
          <div className="meta">
            {!isInChannel && (
              <Typography
                className="video-card-channel"
                sx={{
                  ":hover": {
                    color: "white",
                  },
                }}
                onClick={(e) => {
                  e.stopPropagation(); // Prevents the card click event
                  navigate(`/channel/${channelId}`);
                }}
              >
                {channelName}
              </Typography>
            )}
            <p className="video-card-meta">
              {views} views • {formatUploadTime(uploadTime)}
            </p>
          </div>
        </div>

        <Tooltip title="more">
          <IconButton
            aria-label="more"
            aria-controls="video-card-menu"
            aria-haspopup="true"
            sx={{
              display: !!!channelInfo && "none",
              position: "absolute",
              right: "0",
              opacity: isInView ? 1 : 0,
              transition: "all 0.2s ",
            }}
            onClick={handleMenuOpen}
          >
            <MoreVert
              sx={{
                fontSize: "22px",
              }}
            />
          </IconButton>
        </Tooltip>
        <Menu
          id="video-card-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          MenuListProps={{
            "aria-labelledby": "more-button",
          }}
        >
          <MenuItem
            onClick={(e) => {
              handleMenuClose(e);

              console.log("Option 2 clicked");
            }}
            sx={{
              display: "flex",
              gap: "10px",
            }}
          >
            <BookmarkAddOutlined />
            Add to Playlist
          </MenuItem>
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();

              console.log("Option 1 clicked");
            }}
            sx={{
              display: "flex",
              gap: "10px",
            }}
          >
            <WatchLaterOutlined />
            Save to Watch Later
          </MenuItem>
          {isOwner && (
            <MenuItem
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/update-video?videoId=${id}`);
                console.log("Option 3 clicked");
              }}
              sx={{
                display: "flex",
                gap: "10px",
              }}
            >
              <EditOutlined />
              Edit Video Details
            </MenuItem>
          )}
        </Menu>
      </div>
    </div>
  );
};

export default VideoCard;
