import { Box, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import LongVideoCard from "../../component/cards/LongVideoCard";
import api from "../../utils/api.js";
import { CHANNEL_WATCH_HISTORY, PLAYLIST_VIDEOS } from "../../utils/constants";
import PlaylistSideArea from "../../component/PlaylistSideArea";
import { useNavigate, useSearchParams } from "react-router-dom";
import pic from "/assets/emptyPlaylist.png";
import toast from "react-hot-toast";
import { useAppStore } from "../../store";
import { useInfinteScroll } from "../../hooks/infinteScrolling";

const PlaylistContent = () => {
  // useState ********************************************************************************************
  const [playlistVideos, setPlaylistVideos] = useState([]);
  const { channelInfo } = useAppStore();
  const [playlist, setPlaylist] = useState({
    title: "",
    thumbnail: "temp",
    videos: "temp",
  });
  const [loading, setLoading] = useState(false);

  // useRef **********************************************************************************************
  const isFetching = useRef(false); // I am using this for my infinte scrolling, as its .current values changes instantly as i change them but it does not cause a rerender, also it persists throughout every render
  const hasMore = useRef(true);
  const cursor = useRef(null);

  // constants *********************************************************************************************
  const navigate = useNavigate();
  const [params] = useSearchParams();
  let playlistId = params.get("playlistId");

  // useEffects ***********************************************************************************************************
  useEffect(() => {
    // Log playlistId only when it changes
    // Handle playlistId validation and navigation
    if (playlistId?.toString() === "history") {
      playlistId = channelInfo?.permanentPlaylist?.watchHistory;
    }

    if (
      !playlistId ||
      playlistId?.length === 0 ||
      playlistId?.toString() === "undefined" ||
      playlistId?.toString() === "null"
    ) {
      toast.error("Something went wrong");
      navigate("/", { replace: true });
      return;
    }
  }, [playlistId, channelInfo, navigate]);

  // functions ***********************************************************************************************
  const getPlaylistVideos = async () => {
    if (!hasMore.current || isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    try {
      const { data } = await api.get(
        `${PLAYLIST_VIDEOS}?playlistId=${playlistId}&cursor=${JSON.stringify(
          cursor.current
        )}&limit=20`
      );
      hasMore.current = data.hasMore;
      cursor.current = data.nextCursor;

      if (cursor.current === null) {
        let plyalistThumbnail;
        if (data.videos?.length)
          plyalistThumbnail = data.videos[0]?.thumbnailUrl;
        else plyalistThumbnail = pic;

        setPlaylist((pre) => ({
          ...pre,
          title: data.playlist?.name,
          thumbnail: plyalistThumbnail,
          videos: data.playlist?.videosCount,
          videoId: data.videos[0]?._id,
          playlistId: data.playlist?._id,
          isOwner: data?.isOwner,
        }));
      }
      setPlaylistVideos((pre) => [...pre, ...data.videos]);
      return data;
    } catch (err) {
      // Handle error
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };
  // title: data.playlist?.name,
  //         thumbnail: plyalistThumbnail,
  //         videos: data.playlist?.videosCount,
  //         videoId: data.videos[0]?._id,
  //         playlistId: data.playlist?._id,

  useEffect(() => {
    const handleScroll = () => {
      if (isFetching.current || !hasMore.current) return;
      const bottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 100;

      if (bottom) {
        getPlaylistVideos();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []); // Remove cursor dependency to prevent unnecessary re-renders

  useEffect(() => {
    // Only fetch videos if we have a valid playlistId
    if (
      playlistId &&
      playlistId !== "undefined" &&
      playlistId !== "null" &&
      playlistId.length > 0
    ) {
      getPlaylistVideos();
    }

    return () => {
      hasMore.current = true;
      cursor.current = null;
      isFetching.current = false;

      setPlaylist({
        title: "",
        thumbnail: "temp",
        videos: "temp",
      });
      setPlaylistVideos([]);
    };
  }, [playlistId]);

  useEffect(() => {
    return () => {
      if (playlistVideos?.length) {
        setPlaylist((pre) => {
          let pree = { ...pre };
          pree.videos = pree.videos - 1;
          let thumbnail = pic;
          if (playlistVideos[1]?.thumbnailUrl)
            thumbnail = playlistVideos[1].thumbnailUrl;
          let videoId = null;
          if (playlistVideos[0]?._id) videoId = playlistVideos[0]?._id;

          return {
            ...pree,
            thumbnail,
            videoId,
          };
        });
      }
    };
  }, [playlistVideos]);

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
        {loading && !playlistVideos?.length && "Loading ..."}

        {playlistVideos?.length ? (
          <>
            {playlistVideos?.map((video, index) => {
              return (
                <LongVideoCard
                  key={index}
                  remove={`Remove from ${playlist?.title}`}
                  video={video}
                  playlist={playlistId}
                  setPlaylistVideos={setPlaylistVideos}
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
