import React, { useRef, useEffect } from "react";
import LongVideoCard from "./cards/LongVideoCard";
import CloseIcon from "@mui/icons-material/Close";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import RepeatIcon from "@mui/icons-material/Repeat";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { useInfinteScroll } from "../hooks/infinteScrolling";
import api from "../utils/api.js";
import { GET_PLAYLIST_VIDEOS } from "../utils/constants";
import { CircularProgress } from "@mui/material";

const getPlaylistVideos = async ({ pageParam = null, queryKey }) => {
  const [_key, playlistId] = queryKey;

  const apiLink = `${GET_PLAYLIST_VIDEOS}?playlistId=${playlistId}&cursor=${JSON.stringify(
    pageParam
  )}&limit=20`;

  const { data } = await api.get(apiLink);
  return data;
};

const PlayingPlaylistComp = ({
  playlist,
  playingVideoId,
  setPlayingPlaylist,
}) => {
  const navigate = useNavigate();
  const playlistContainerRef = useRef(null);
  const { data, isLoading, isError, isFetchingNextPage } = useInfinteScroll(
    ["playlistVideos", playlist?._id],
    getPlaylistVideos,
    {},
    50, // smaller offset for playlist container
    playlistContainerRef
  );

  const videos = data?.pages.flatMap((page) => page.videos) || [];
  console.log("in playing playlist comp", data);

  // Add custom scrollbar styles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(32, 32, 32, 0.8);
        border-radius: 3px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(96, 96, 96, 0.8);
        border-radius: 3px;
        transition: background 0.2s ease;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(128, 128, 128, 0.9);
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const navigateToVideo = (videoId) => {
    navigate(`/video-player/${videoId}?playlist=${playlist._id}`);

    return;
  };

  const closePlaylist = () => {
    setPlayingPlaylist(false);
    navigate(`/video-player/${playingVideoId}`);

    return;
  };

  const repeat = () => {};

  const shuffle = () => {};

  if (isError) {
    return (
      <div className="text-center py-4 text-red-400">
        Error loading playlist videos
      </div>
    );
  }

  return (
    <div className="bg-[#0f0f0f]  rounded-xl overflow-hidden shadow-2xl border border-[#303030]">
      {/* Header Section */}
      <div className="bg-[#1f1f1f] border-b border-[#303030] p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white truncate mb-1">
              {playlist?.name}
            </h3>
            <p className="text-sm text-[#aaa] truncate">
              {playlist.channel?.channelName}
            </p>
          </div>
          <button
            onClick={closePlaylist}
            className="p-1.5 hover:bg-[#303030] rounded-full transition-all duration-200 text-[#aaa] hover:text-white ml-2"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>
        <span className="text-xs text-[#aaa] bg-[#303030] px-2 py-1 rounded-full">
          {data?.pages[0]?.playlist?.videosCount} videos
        </span>
      </div>

      {/* Videos Container */}
      <div
        ref={playlistContainerRef}
        className="max-h-[400px] overflow-y-auto overflow-x-hidden custom-scrollbar"
      >
        {isLoading ? (
          <div className="text-center py-8">
            <CircularProgress size={24} className="text-[#ff0000]" />
            <p className="text-[#aaa] text-sm mt-2">Loading playlist...</p>
          </div>
        ) : (
          <div className="p-2 ">
            {videos?.map((video, index) => (
              <div
                key={video._id || index}
                onClick={() => navigateToVideo(video._id)}
                className={`group relative mb-2  rounded-lg transition-all duration-200 cursor-pointer ${
                  video._id === playingVideoId
                    ? "bg-[#2a2a2a] border border-[#404040]"
                    : "hover:bg-[#1a1a1a] hover:border-[#404040] border border-transparent"
                }`}
              >
                <div className="pt-3 pl-1 pb-0">
                  <LongVideoCard
                    video={video}
                    showVideoChannelDetails={false}
                  />
                </div>

                {/* Playing Indicator */}
                {video._id === playingVideoId && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-[#ff0000] rounded-full animate-pulse"></div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-[#ffffff] opacity-0 group-hover:opacity-[0.03] transition-opacity duration-200 rounded-lg pointer-events-none"></div>
              </div>
            ))}
          </div>
        )}

        {/* Loading indicator for next page */}
        {isFetchingNextPage && (
          <div className="text-center py-4">
            <CircularProgress size={20} className="text-[#ff0000]" />
            <p className="text-[#aaa] text-xs mt-1">Loading more...</p>
          </div>
        )}
      </div>

      {/* Empty State */}
      {!isLoading && videos.length === 0 && (
        <div className="text-center py-8 px-4">
          <div className="w-16 h-16 mx-auto mb-3 bg-[#2a2a2a] rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[#aaa]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </div>
          <p className="text-[#aaa] text-sm">No videos in this playlist</p>
        </div>
      )}
    </div>
  );
};

export default PlayingPlaylistComp;
