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
  DeleteOutlined,
} from "@mui/icons-material";
import { useAppStore } from "../../store/index.js";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ADD_VIDEO_TO_PLAYLISTS,
  DELETE_VIDEO,
  GET_MY_PLAYLISTS,
  REMOVE_VIDEO_FROM_PLAYLISTS,
} from "../../utils/constants.js";

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
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
            <img
              src={channelProfile}
              alt={channelName}
              className="channel-avatar"
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
  );
};

export default VideoCard;

export const MoreIconButton = ({
  channelInfo,
  isInView,
  isOwner = false,
  videoId = null,
  removeFrom = "",
  playlistId = null,
  setPlaylistVideos,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [availablePlaylists, setAvailablePlaylists] = useState([]);
  const [schedulePlaylistAdd, setSchedulePlaylistAdd] = useState([]);
  const [schedulePlaylistRemove, setSchedulePlaylistRemove] = useState([]);
  const [alreadyPresentPlaylist, setAlreadyPresentPlaylist] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [createNewPlaylist, setCreateNewPlaylist] = useState(false);
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);

  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };
  const handleMenuClose = (e) => {
    e.stopPropagation();
    setAnchorEl(null);
  };
  const openModal = async (e) => {
    e.stopPropagation();
    setAnchorEl(null);
    setModalOpen(true);
    try {
      const { data } = await axios.get(`${GET_MY_PLAYLISTS}/${videoId}`, {
        withCredentials: true,
      });
      console.log("playlist data", data);

      setAvailablePlaylists(
        data.playlists.filter(
          (p) =>
            p._id !== channelInfo?.permanentPlaylist.likedVideos &&
            p._id !== channelInfo?.permanentPlaylist.watchHistory
        )
      );

      const pl = data.playlists.filter((p) => p.isPresent).map((p) => p._id);
      setAlreadyPresentPlaylist(pl);
    } catch (error) {
      toast.error("Error fetching playlists");
    } finally {
    }
  };
  const closeModal = () => {
    setCreateNewPlaylist(false);
    setAvailablePlaylists([]);
    setAlreadyPresentPlaylist([]);
    setModalOpen(false);
    setDeleteModalOpen(false);
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
    let playlistIds = schedulePlaylistAdd;

    if (!playlistIds.length) {
      playlistIds.push(channelInfo?.watchLater);
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
      setAlreadyPresentPlaylist((pre) => [...pre, ...schedulePlaylistAdd]);
    } catch (err) {
      console.log("error in adding videos to playlists");
      toast.error(err.response?.data?.message || "Something went wrong", {
        id: toastId,
      });
    } finally {
      setSchedulePlaylistAdd([]);
    }
  };

  const deleteVideo = async (videoId) => {
    const toastId = toast.loading("Deleting Video...");
    closeModal();
    try {
      await axios.delete(DELETE_VIDEO, {
        data: { videoId },
        withCredentials: true,
      });
      toast.success("Video Deleted Successfully", { id: toastId });
    } catch (err) {
      toast.error(err.response.data?.message || "Something went wrong", {
        id: toastId,
      });
    }
  };

  const removeVideoFromPlyalist = async () => {
    closeModal();
    let playlistIds = schedulePlaylistRemove;

    if (playlistId) playlistIds.push(playlistId);

    const data = { playlistIds, videoId };

    try {
      await axios.delete(REMOVE_VIDEO_FROM_PLAYLISTS, {
        data,
        withCredentials: true,
      });

      if (playlistId && setPlaylistVideos)
        setPlaylistVideos((pre) => {
          let temp = [...pre];
          console.log("pre temp ", temp);
          temp = temp.filter((t) => t._id !== videoId);
          console.log("after temp", temp);
          return temp;
        });
      setAlreadyPresentPlaylist((prev) =>
        prev.filter((p) => !schedulePlaylistRemove.includes(p))
      );
      toast.success("Video removed.");
    } catch (err) {
      console.log("error in removing videos to playlists");
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSchedulePlaylistRemove([]);
    }
    console.log("out");
  };

  const handleCheckClick = (id) => {
    const alreadyPresent = alreadyPresentPlaylist.includes(id);
    if (alreadyPresent) {
      setSchedulePlaylistRemove((prev) => {
        if (prev.includes(id)) {
          return prev.filter((p) => p !== id);
        } else {
          return [...prev, id];
        }
      });
    } else {
      setSchedulePlaylistAdd((prev) => {
        if (prev.includes(id)) return prev.filter((p) => p !== id);
        else return [...prev, id];
      });
    }
  };

  const handleConfirm = async () => {
    if (schedulePlaylistAdd.length) addVideoToPlaylists();
    if (schedulePlaylistRemove.length) removeVideoFromPlyalist();
  };

  return (
    <>
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
            openModal(e);
          }}
          sx={{
            display: "flex",
            gap: "10px",
          }}
        >
          <BookmarkAddOutlined />
          Add to Playlist
        </MenuItem>

        {removeFrom.length ? (
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              removeVideoFromPlyalist();
            }}
            sx={{
              display: "flex",
              gap: "10px",
            }}
          >
            <DeleteOutline />
            {removeFrom}
          </MenuItem>
        ) : (
          <></>
        )}

        {isOwner && (
          <>
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
            <MenuItem
              onClick={(e) => {
                e.stopPropagation();
                setDeleteModalOpen(true);
              }}
              sx={{
                display: "flex",
                gap: "10px",
                color: "red",
              }}
            >
              <DeleteOutlined />
              Delete Video
            </MenuItem>
          </>
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
                {availablePlaylists.map((playlist) => (
                  <ListItem
                    key={playlist._id}
                    button
                    sx={{
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                    onClick={(e) => {
                      console.log("clicked");
                      handleCheckClick(playlist._id);
                    }}
                  >
                    <ListItemIcon>
                      <Checkbox
                        checked={
                          alreadyPresentPlaylist
                            .filter((p) => !schedulePlaylistRemove.includes(p))
                            .includes(playlist._id) ||
                          schedulePlaylistAdd.includes(playlist._id)
                        }
                      />
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
                    {playlist.isPrivate ? (
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
                  onClick={handleConfirm}
                  disabled={
                    !schedulePlaylistAdd.length &&
                    !schedulePlaylistRemove.length
                  }
                  sx={{
                    bgcolor:
                      schedulePlaylistAdd.length ||
                      schedulePlaylistRemove.length
                        ? "#16a34a"
                        : "#4b5563", // Green when active, Gray when disabled
                    color: "white",
                    fontWeight: "bold",
                    borderRadius: "12px",
                    py: 1.5,
                    boxShadow:
                      schedulePlaylistAdd.length ||
                      schedulePlaylistRemove.length
                        ? "0px 4px 10px rgba(0,0,0,0.2)"
                        : "none",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor:
                        schedulePlaylistAdd.length ||
                        schedulePlaylistRemove.length
                          ? "#15803d"
                          : undefined,
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

      <Modal
        open={deleteModalOpen}
        onClick={(e) => e.stopPropagation()}
        onClose={() => {
          setDeleteModalOpen(false);
        }}
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
            width: 340,
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
              fontSize: "16px",
            }}
          >
            Delete the Video? <br /> This action cannot be undone.
          </Typography>

          <Divider />
          <Box
            sx={{
              mt: "15px",
              display: "flex",
              justifyContent: "end",
              gap: "6px",
            }}
          >
            <Button
              onClick={() => {
                closeModal();
              }}
            >
              Cancle
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => deleteVideo(videoId)}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};
