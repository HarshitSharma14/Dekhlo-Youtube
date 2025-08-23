import { Box, Typography, CircularProgress } from "@mui/material";
import React, { useEffect, useState } from "react";
import LongVideoCard from "../../component/cards/LongVideoCard";
import api from "../../utils/api.js";
import { CHANNEL_WATCH_HISTORY, PLAYLIST_VIDEOS } from "../../utils/constants";
import PlaylistSideArea from "../../component/PlaylistSideArea";
import { useNavigate, useSearchParams } from "react-router-dom";
import pic from "/assets/emptyPlaylist.png";
import toast from "react-hot-toast";
import { useAppStore } from "../../store";
import { useInfinteScroll } from "../../hooks/infinteScrolling";

const getPlaylistVideos = async ({ pageParam = null, queryKey }) => {
  const [_key, playlistId] = queryKey;

  const apiLink = `${PLAYLIST_VIDEOS}?playlistId=${playlistId}&cursor=${JSON.stringify(
    pageParam
  )}&limit=20`;

  const { data } = await api.get(apiLink);
  return data;
};

const PlaylistContent = () => {
  // useState ********************************************************************************************
  const { channelInfo } = useAppStore();
  const [playlist, setPlaylist] = useState({
    title: "",
    thumbnail: "temp",
    videos: "temp",
    videoId: null,
    playlistId: "",
    isOwner: false,
  });

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

  // Use the enhanced infinite scroll hook
  const { data, isLoading, isError, isFetchingNextPage, hasNextPage } =
    useInfinteScroll(["playlistVideos", playlistId], getPlaylistVideos, {
      enabled:
        !!playlistId &&
        playlistId !== "undefined" &&
        playlistId !== "null" &&
        playlistId.length > 0,
    });

  const videos = data?.pages.flatMap((page) => page.videos) || [];
  console.log("in playlist content", videos);

  // Update playlist info when data changes
  useEffect(() => {
    if (data?.pages?.[0]) {
      const firstPage = data.pages[0];
      let playlistThumbnail = pic;

      if (firstPage.videos?.length > 0) {
        playlistThumbnail = firstPage.videos[0]?.thumbnailUrl || pic;
      }

      setPlaylist({
        title: firstPage.playlist?.name || "",
        thumbnail: playlistThumbnail,
        videos: firstPage.playlist?.videosCount || 0,
        videoId: firstPage.videos?.[0]?._id || null,
        playlistId: firstPage.playlist?._id || "",
        isOwner: firstPage?.isOwner || false,
      });
    }
  }, [data]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      setPlaylist({
        title: "",
        thumbnail: "temp",
        videos: "temp",
        videoId: null,
        playlistId: "",
        isOwner: false,
      });
    };
  }, []);

  if (isError) {
    return (
      <div className="text-center py-8 text-red-400">
        Error loading playlist videos
      </div>
    );
  }

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

        {isLoading && !videos?.length && (
          <div className="text-center py-8">
            <CircularProgress size={24} className="text-[#ff0000]" />
            <p className="text-gray-400 text-sm mt-2">Loading playlist...</p>
          </div>
        )}

        {videos?.length ? (
          <>
            {videos?.map((video, index) => {
              return (
                <div className="mb-4" key={video._id || index}>
                  <LongVideoCard
                    remove={`Remove from ${playlist?.title}`}
                    video={video}
                    playlist={playlistId}
                    setPlaylistVideos={() => {}} // This is no longer needed with infinite scroll
                  />
                </div>
              );
            })}

            {/* Loading indicator for next page */}
            {isFetchingNextPage && (
              <div className="text-center py-4">
                <CircularProgress size={20} className="text-[#ff0000]" />
                <p className="text-gray-400 text-xs mt-1">
                  Loading more videos...
                </p>
              </div>
            )}

            {/* Show more button for mobile or when infinite scroll might not work */}
            {hasNextPage && !isFetchingNextPage && (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm">
                  Scroll down to load more videos
                </p>
              </div>
            )}
          </>
        ) : (
          !isLoading && (
            <div className="text-center py-8 text-gray-400">
              No Videos to Show
            </div>
          )
        )}
      </Box>
    </Box>
  );
};

export default PlaylistContent;
