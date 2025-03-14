import { MoreVert, Palette, PlayArrow, Share } from "@mui/icons-material";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Typography,
} from "@mui/material";
import ColorThief from "colorthief";
import React, { useEffect, useState } from "react";
import { useAppStore } from "../store/index.js";
import pic from "/assets/watchHistoryCover.jpg";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
const samplePlaylist = {
  title: "Watch History",
  thumbnail: pic,
  videoId: null,
};
const PlaylistSideArea = ({ playlist = samplePlaylist, history = false }) => {
  const [playlistToShow, setPlaylistToShow] = useState(playlist);

  const [bgColor, setBgColor] = useState("#1e1e1e");
  const { channelInfo } = useAppStore();
  const navigate = useNavigate();

  const handleClick = () => {
    console.log("play all ", playlist);
    if (playlist?.videoId && playlist?.playlistId) {
      const route = `/video-player/${playlist.videoId}?playlist=${playlist.playlistId}`;
      navigate(route);
      return;
    }
    toast("Something went wrong");
    // const videoId = video?._id;
    // const playlistId = playlist;
    // let route = `/video-player/${videoId}`;
    // if (playlistId) route = route + `?playlist=${playlistId}`;
    // navigate(route);
  };

  if (!playlistToShow.thumbnail)
    setPlaylistToShow((pre) => (pre.thumbnail = pic));
  useEffect(() => {
    setPlaylistToShow(playlist);
  }, [playlist]);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = playlistToShow.thumbnail;
    img.onload = () => {
      const colorThief = new ColorThief();
      const dominantColor = colorThief.getColor(img);
      setBgColor(
        `linear-gradient(to bottom, rgb(${dominantColor.join(",")}), #1e1e1e)`
      );
    };
  }, [playlistToShow.thumbnail]);

  return (
    <Card
      sx={{
        width: { xs: "98%", md: 320 },
        borderRadius: 3,
        background: bgColor,
        color: "#fff",
        padding: 2,
        maxWidth: "100%",
        margin: "auto",
        minHeight: "85vh",
        position: "sticky",
        top: "70px",
        "@media (max-width:900px)": {
          minHeight: "0",
        },
      }}
    >
      {/* Thumbnail with dark gradient overlay */}
      <div style={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="180"
          image={
            playlistToShow.thumbnail.length ? playlistToShow.thumbnail : pic
          }
          alt={playlistToShow.title}
          sx={{ objectFit: "cover", width: "100%" }}
        />
      </div>

      {/* Playlist Info */}
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {playlistToShow.title}
        </Typography>
        {history && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar
              src={channelInfo.profilePhoto}
              alt={playlistToShow.owner}
              sx={{ width: 32, height: 32 }}
            />
            <Typography variant="body2" color="gray">
              {channelInfo.channelName}
            </Typography>
          </div>
        )}
        {!history && (
          <>
            <Typography variant="body2" color="gray" mt={0.5}>
              Playlist • {playlistToShow.videos} videos
            </Typography>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: 10,
              }}
            >
              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                sx={{ textTransform: "none" }}
                onClick={() => handleClick()}
              >
                Play all
              </Button>

              <IconButton>
                <Share />
              </IconButton>
              <IconButton>
                <MoreVert />
              </IconButton>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PlaylistSideArea;
