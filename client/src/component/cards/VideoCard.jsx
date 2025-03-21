import {
  Menu,
  MenuItem,
  Tooltip,
  Popover,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  IconButton,
  Button,
  Typography,
  Divider,
  Box,
  Modal,
  TextField,
  FormControlLabel,
  Avatar,
  CardMedia,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatUploadTime } from "../../utils/helper.js";
import "./VideoCard.css";
import {
  BookmarkAddOutlined,
  EditOutlined,
  MoreVert,
  WatchLaterOutlined,
  Lock as LockIcon,
  Public as PublicIcon,
  Add as AddIcon,
  Close,
  DeleteOutline,
} from "@mui/icons-material";
import { useAppStore } from "../../store/index.js";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ADD_VIDEO_TO_PLAYLISTS,
  GET_MY_PLAYLISTS,
} from "../../utils/constants.js";

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const video = {
  _id: "1a2b3c4d",
  title: "Exploring the Streets of New York City in 4K",
  views: "1.2M",
  duration: 1345, // in seconds (approx 22 minutes and 25 seconds)
  createdAt: "2023-06-15T14:30:00Z", // ISO format for date
  thumbnailUrl:
    "https://images.pexels.com/photos/30426849/pexels-photo-30426849/free-photo-of-urban-black-and-white-bicycle-scene.jpeg?auto=compress&cs=tinysrgb&w=400&lazy=load",
  videoUrl:
    "https://static.videezy.com/system/resources/previews/000/006/997/original/MR8_8189.mp4",
  description:
    "Take a breathtaking virtual tour through the streets of New York City, exploring famous landmarks and hidden gems in stunning 4K quality.",
};

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
  duration = 0,
}) => {
  // useState *********************************************************************************************
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [timeleft, setTimeleft] = useState(formatTime(duration));

  // constant ********************************************************************************************
  const cardRef = useRef(null);
  const videoRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const { channelInfo } = useAppStore();

  // function *********************************************************************************************

  const handleHover = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };
  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setTimeleft(formatTime(duration));
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

  const [showThumb, setShowThumb] = useState(false);
  const handleSeek = (e) => {
    e.stopPropagation();
    const rect = e.target.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * videoRef.current.duration;
    videoRef.current.currentTime = newTime;
  };
  return (
    <>
      <div
        ref={cardRef}
        onClick={() => navigate(`/video-player/${id}`)}
        className="video-card"
        style={{
          height: isInChannel ? "270px" : "333px",
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

              {/* Progress bar ****************************************************** */}
              {isHovered && (
                <Box
                  sx={{
                    height: "16px",
                    width: "100%",
                    position: "absolute",
                    bottom: "0px",
                    // boxSizing: "border-box",
                    // borderBottom: "8px solid #121212",
                    left: 0,
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => setShowThumb(true)}
                  onMouseLeave={() => setShowThumb(false)}
                  onClick={handleSeek}
                >
                  <Box
                    sx={{
                      height: "4px",
                      bgcolor: "gray",
                      width: "100%",
                      position: "absolute",
                      bottom: "0px",
                      left: 0,
                      cursor: "pointer",
                    }}
                  >
                    <Box
                      sx={{
                        height: "100%",
                        bgcolor: showThumb ? "#ff0000" : "#400f0f",
                        width: `${progress}%`,
                        position: "relative",
                      }}
                    ></Box>
                  </Box>
                </Box>
              )}
            </div>
          )}
          <CardMedia
            component="img"
            image={thumbnail}
            alt="Thumbnail"
            loading="lazy"
            sx={{
              display: isHovered && "hidden",
              aspectRatio: "16/9",
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />

          <div
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              color: "white",
              position: "absolute",
              right: "10px",
              bottom: "16px",
              fontSize: "12px",
              padding: "4px 8px",
              borderRadius: "5px",
              fontWeight: "bold",
            }}
          >
            {timeleft.length ? timeleft : "22:44"}
            {/* {timeleft.length ? timeleft : "22:44"} */}
          </div>
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
              {/* <img
              src={channelProfile}
              alt={channelName}
              className="channel-avatar"
            /> */}
              <Avatar
                src={channelProfile}
                sx={{
                  width: "40px",
                  height: "40px",
                }}
              />
            </div>
          )}
          <div className="video-card-details">
            <h3
              className="video-card-title"
              style={{
                width: "95%",
              }}
            >
              {title}
            </h3>
            <div className="meta">
              {!isInChannel && (
                <Typography
                  className="video-card-channel"
                  sx={{
                    display: "inline-block",
                    maxWidth: "100%",
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
          <MoreIconButton
            channelInfo={channelInfo}
            isInView={isInView}
            isOwner={isOwner}
            videoId={id}
          />
        </div>
      </div>
    </>
  );
};

export default VideoCard;

export const MoreIconButton = ({
  channelInfo,
  isInView,
  isOwner = false,
  videoId,
  removeFrom = "",
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [createNewPlaylist, setCreateNewPlaylist] = useState(false);
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [playlistInfo, setPlaylistInfo] = useState(channelInfo);

  const getPlaylists = async () => {
    try {
      const { data } = await axios.get(GET_MY_PLAYLISTS, {
        withCredentials: true,
      });
      console.log("my playlists ", data);
      setPlaylistInfo(data);
    } catch (error) {
      console.log("error fetiching playlist ", error);
    }
  };

  const open = Boolean(anchorEl);

  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };
  const handleMenuClose = (e) => {
    e.stopPropagation();
    setAnchorEl(null);
  };
  const closeModal = () => {
    setCreateNewPlaylist(false);
    setPlaylists([]);
    setModalOpen(false);
    setAnchorEl(null);
  };
  const createPlaylist = async () => {
    closeModal();
    const playlistIds = [];
    const toastId = toast.loading("Creating new Playlist...");
    const dataToSend = {
      playlistIds,
      name,
      isPrivate,
      videoId,
    };
    console.log("crenew play", dataToSend);
    try {
      await axios.post(ADD_VIDEO_TO_PLAYLISTS, dataToSend, {
        withCredentials: true,
      });
      toast.success("Video added to new playlist", { id: toastId });
    } catch (err) {
      console.log("erro creating playlist", err);
      toast.error(err.response?.data?.message || "Something went wrong", {
        id: toastId,
      });
    } finally {
      setName("");
      setIsPrivate(true);
    }
  };

  const addVideoToPlaylists = async () => {
    closeModal();
    let playlistIds = playlists;
    if (!playlistIds.length) {
      playlistIds.push(playlistInfo?.watchLater);
    }
    const dataToSend = { playlistIds, videoId };
    console.log("add vid", dataToSend);

    const toastId = toast.loading("Adding video to playlist...");
    try {
      await axios.post(ADD_VIDEO_TO_PLAYLISTS, dataToSend, {
        withCredentials: true,
      });
      console.log("suee");
      toast.success("Video added.", { id: toastId });
    } catch (err) {
      console.log("error in adding videos to playlists");
      toast.error(err.response?.data?.message || "Something went wrong", {
        id: toastId,
      });
    } finally {
      setPlaylists([]);
    }
  };

  return (
    <>
      <Tooltip title="more">
        <IconButton
          aria-label="more"
          aria-controls="video-card-menu"
          aria-haspopup="true"
          sx={{
            display: !!!playlistInfo && "none",
            position: "absolute",
            right: "0",
            opacity: isInView ? 1 : 0,
            transition: "all 0.2s ",
            "@media (max-width:530px)": {
              opacity: "1",
            },
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
            e.stopPropagation();
            setAnchorEl(null);
            getPlaylists();
            setModalOpen(true);
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
            addVideoToPlaylists();
          }}
          sx={{
            display: "flex",
            gap: "10px",
          }}
        >
          {removeFrom.length ? (
            <>
              <DeleteOutline />
              {removeFrom}
            </>
          ) : (
            <>
              <WatchLaterOutlined />
              "Save to Watch Later"{" "}
            </>
          )}
        </MenuItem>
        {isOwner && (
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/update-video?videoId=${videoId}`);
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

      <Modal
        open={modalOpen}
        onClick={(e) => e.stopPropagation()}
        onClose={closeModal}
        slotProps={{
          backdrop: { style: { backgroundColor: "transparent" } },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 300,
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 2,
            p: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              px: 2,
              pb: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {createNewPlaylist ? "New Playlist" : "Save video to..."}
            <IconButton
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                color: "gray",
              }}
              onClick={closeModal}
            >
              <Close />
            </IconButton>
          </Typography>

          <Divider />
          {createNewPlaylist ? (
            <>
              <Box
                sx={{
                  textAlign: "center",
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  alignItems: "center",
                }}
              >
                <TextField
                  label="Choose a title"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                  }} // Use onChange instead of onClick
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isPrivate}
                      onChange={(e) => {
                        setIsPrivate(e.target.checked);
                      }}
                      sx={{ color: "white" }}
                    />
                  }
                  label="Make playlist private"
                />
                <Button
                  fullWidth
                  onClick={createPlaylist}
                  disabled={!name.trim().length}
                  sx={{
                    bgcolor: name.length ? "#16a34a" : "#4b5563", // Green when active, Gray when disabled
                    color: "white",
                    fontWeight: "bold",
                    borderRadius: "12px",
                    py: 1.5,
                    boxShadow: name.length
                      ? "0px 4px 10px rgba(0,0,0,0.2)"
                      : "none",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor: name.length ? "#15803d" : undefined,
                    },
                    "&:disabled": {
                      opacity: 0.6,
                      cursor: "not-allowed",
                    },
                  }}
                >
                  Confirm
                </Button>
              </Box>
            </>
          ) : (
            <>
              {" "}
              <List
                sx={{
                  maxHeight: "320px",
                  overflow: "auto",
                }}
              >
                {playlistInfo?.playlists.map((playlist, index) => (
                  <ListItem
                    key={index}
                    button
                    sx={{
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                    onClick={(e) => {
                      console.log("clicked");
                      setPlaylists(
                        (prev) =>
                          prev.includes(playlist._id)
                            ? prev.filter((id) => id !== playlist._id) // Remove if already selected
                            : [...prev, playlist._id] // Add if not selected
                      );
                    }}
                  >
                    <ListItemIcon>
                      <Checkbox checked={playlists.includes(playlist._id)} />
                    </ListItemIcon>
                    <Typography
                      noWrap
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        width: "150px", // Adjust as needed
                      }}
                    >
                      {playlist.name}
                    </Typography>
                    {playlist.private ? (
                      <LockIcon fontSize="small" />
                    ) : (
                      <PublicIcon fontSize="small" />
                    )}
                  </ListItem>
                ))}
              </List>
              <Divider />
              <Box
                sx={{
                  textAlign: "center",
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  alignItems: "center",
                }}
              >
                {/* Confirm Button */}
                <Button
                  fullWidth
                  onClick={addVideoToPlaylists}
                  disabled={!playlists.length}
                  sx={{
                    bgcolor: playlists.length ? "#16a34a" : "#4b5563", // Green when active, Gray when disabled
                    color: "white",
                    fontWeight: "bold",
                    borderRadius: "12px",
                    py: 1.5,
                    boxShadow: playlists.length
                      ? "0px 4px 10px rgba(0,0,0,0.2)"
                      : "none",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor: playlists.length ? "#15803d" : undefined,
                    },
                    "&:disabled": {
                      opacity: 0.6,
                      cursor: "not-allowed",
                    },
                  }}
                >
                  Confirm
                </Button>

                {/* New Playlist Button */}
                <Button
                  startIcon={<AddIcon />}
                  fullWidth
                  onClick={(e) => {
                    setCreateNewPlaylist(true);
                  }}
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    border: "2px solid white",
                    borderRadius: "12px",
                    py: 1.5,
                    boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  New Playlist
                </Button>
              </Box>{" "}
            </>
          )}
        </Box>
      </Modal>
    </>
  );
};
