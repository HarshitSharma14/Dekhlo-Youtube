import { Box, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import LongVideoCard from "../../component/cards/LongVideoCard";
import axios from "axios";
import { CHANNEL_WATCH_HISTORY, PLAYLIST_VIDEOS } from "../../utils/constants";
import PlaylistSideArea from "../../component/PlaylistSideArea";
import { useNavigate, useSearchParams } from "react-router-dom";

const PlaylistContent = () => {
  // useState ********************************************************************************************
  const [playlistVideos, setPlaylistVideos] = useState([]);
  const [playlist, setPlaylist] = useState({
    title: "",
    thumbnail: "temp",
    videos: "temp",
  });
  const [totalPages, setTotalPages] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // useRef **********************************************************************************************
  const isFetching = useRef(null); // I am using this for my infinte scrolling, as its .current values changes instantly as i change them but it does not cause a rerender, also it persists throughout every render

  // constants *********************************************************************************************
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const playlistId = params.get("playlistId");
  if (!playlistId || playlistId.length == 0) navigate("/");

  // functions ***********************************************************************************************
  const getPlaylistVideos = async () => {
    if (currentPage > totalPages) return;
    setLoading(true);
    isFetching.current = true;
    try {
      const { data } = await axios.get(
        `${PLAYLIST_VIDEOS}?playlistId=${playlistId}&page=${currentPage}&limit=20`,
        {
          withCredentials: true,
        }
      );
      setCurrentPage(currentPage + 1);
      console.log("data in pl contend ", data);
      setTotalPages(data?.totalPages);
      if (!playlist.title)
        setPlaylist((pre) => ({
          ...pre, // Spread previous state to retain other properties
          title: data.playlist?.name,
          thumbnail: data.playlist?.videos[0]?.thumbnailUrl,
          videos: data.playlist?.videosCount,
          videoId: data.playlist?.videos[0]._id,
          playlistId: data.playlist?._id,
        }));
      setPlaylistVideos((pre) => [...pre, ...data.playlist?.videos]);
    } catch (err) {
      console.log("erro in history");
      console.log(err);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  // useEffects ***********************************************************************************************************
  useEffect(() => {
    const handleScroll = () => {
      const bottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 100;

      if (!isFetching.current && bottom) {
        console.log("in condition");
        getPlaylistVideos();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [currentPage]);

  useEffect(() => {
    getPlaylistVideos();
    return () => {
      setPlaylistVideos([]);
    };
  }, [playlistId]);

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        "@media (max-width:900px)": {
          flexDirection: "column",
        },
      }}
    >
      <Box
        sx={{
          width: "500px",
          "@media (max-width:900px)": {
            width: "100%",
          },
        }}
      >
        <PlaylistSideArea playlist={playlist} />
      </Box>
      <Box
        sx={{
          width: "100%",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            padding: "5px 20px",
            fontWeight: "bold",
            color: "#c1c1c1",
            margin: "6px 0",
          }}
        >
          {playlist?.title}
        </Typography>
        {loading && !playlistVideos.length && "Loading ..."}

        {playlistVideos.length ? (
          <>
            {playlistVideos?.map((video, index) => {
              return (
                <LongVideoCard
                  key={index}
                  remove={`Remove from ${playlist?.title}`}
                  video={video}
                  playlist={playlistId}
                />
              );
            })}
            {loading && <>Loading more videos...</>}
          </>
        ) : (
          "No Videos to Show"
        )}
      </Box>
    </Box>
  );
};

export default PlaylistContent;
