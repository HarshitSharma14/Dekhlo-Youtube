import { Delete, PlayArrow, Share } from "@mui/icons-material";
import {
  Button,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ColorThief from "colorthief";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppStore } from "../store/index.js";
import { DELETE_PLAYLIST } from "../utils/constants.js";
import DeleteDialogBox from "./DeleteDialogBox.jsx";
import pic from "/assets/watchHistoryCover.jpg";

const samplePlaylist = {
  title: "Untitled",
  thumbnail: pic,
  videoId: null,
};
const PlaylistSideArea = ({ playlist = samplePlaylist }) => {
  // const [playlistToShow, setPlaylistToShow] = useState(playlist);

  const [params] = useSearchParams();
  let playlistId = params.get("playlistId");
  console.log(playlistId);
  const { data } = useQuery({
    queryKey: ["playlistDetails", playlistId],
    queryFn: async () => {
      const { data } = await axios.get(
        `${GET_PLAYLIST_Details}?playlistId=${playlistId}`,
        {
          withCredentials: true,
        }
      );
      return data;
    },
  });

  // const playlist = playlist;
  // playlist = playlist?.thumbnail || samplePlaylist.thumbnail;
  const [open, setOpen] = useState(false);

  const [bgColor, setBgColor] = useState("#1e1e1e");
  const { channelInfo } = useAppStore();

  let deleteText = `Are you sure you want to delete "${playlist.title}" playlist`;
  const isLikedVideoPlaylist =
    playlist.playlistId === channelInfo?.permanentPlaylist?.likedVideos;
  const cannotDeltePlaylist =
    playlist.playlistId === channelInfo?.permanentPlaylist?.watchHistory ||
    playlist.playlistId === channelInfo?.permanentPlaylist?.watchLater;

  if (isLikedVideoPlaylist)
    deleteText =
      "All Videos will be removed from this playlist, but the likes will persist on videos.\nDo you want to proceed";
  if (cannotDeltePlaylist)
    deleteText =
      "All Videos will be removed from this playlist, but the playlist is default and cannot be deleted.\nDo you want to proceed";

  const navigate = useNavigate();

  const handleClick = () => {
    if (playlist?.videoId && playlist?.playlistId) {
      const route = `/video-player/${playlist.videoId}?playlist=${playlist.playlistId}`;
      navigate(route);
      return;
    }
    toast.error("Playlist is empty");
  };

  const deleteHandler = async () => {
    try {
      await axios.delete(DELETE_PLAYLIST, {
        data: { playlistId: playlist.playlistId },
        withCredentials: true,
      });
      console.log("delteded");
      navigate(`/channel/${channelInfo?._id}`, { replace: true });
    } catch (error) {
      console.log("erroe in deleting ");
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  // if (!playlist.thumbnail)
  //   setPlaylistToShow((pre) => (pre.thumbnail = pic));
  // useEffect(() => {
  //   setPlaylistToShow(playlist);
  // }, [playlist]);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = playlist.thumbnail;
    img.onload = () => {
      const colorThief = new ColorThief();
      const dominantColor = colorThief.getColor(img);
      setBgColor(
        `linear-gradient(to bottom, rgb(${dominantColor.join(",")}), #1e1e1e)`
      );
    };
  }, [playlist.thumbnail]);

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
        top: "90px",
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
          image={playlist?.thumbnail?.length ? playlist.thumbnail : pic}
          alt={playlist.title}
          sx={{ objectFit: "cover", width: "100%" }}
        />
      </div>

      {/* Playlist Info */}
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {playlist.title}
        </Typography>

        <Typography variant="body2" color="##F3F4F6" mt={0.5}>
          Playlist • {playlist.videos} videos
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

          <IconButton
            onClick={() => {
              navigator.clipboard
                .writeText(`${window.location.href}`)
                .then(() => {
                  toast.success("Copied to clipboard");
                })
                .catch((err) => {
                  toast.error("Something went wrong");
                });
            }}
          >
            <Share />
          </IconButton>

          {data?.isOwner && (
            <>
              <Tooltip title="Delete Playlist">
                <IconButton onClick={() => setOpen(true)}>
                  <Delete />
                </IconButton>
              </Tooltip>

              <DeleteDialogBox
                open={open}
                setOpen={setOpen}
                deleteHandler={deleteHandler}
                deleteText={deleteText}
              />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlaylistSideArea;
