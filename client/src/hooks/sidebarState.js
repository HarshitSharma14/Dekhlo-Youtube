import { useEffect, useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { useAppStore } from "../store";
import { useWindowSize } from "./windowSize";

export const activeOn = {
  isHome: "isHome",
  isSubscriptionVideos: "isSubscriptionVideos",
  isProfile: "isProfile",
  isWatchHistory: "isWatchHistory",
  isWatchLater: "isWatchLater",
  isPlaylist: "isPlaylist",
  isLikedVideos: "isLikedVideos",
  isSubscriptionChannels: "isSubscriptionChannels",
  isSettings: "isSettings",
};

export const useSidebarState = () => {
  const [query] = useSearchParams();
  const playlistId = query.get("playlistId");

  const { setSidebarActivity, channelInfo } = useAppStore();
  const currentPath = useLocation().pathname;

  useEffect(() => {
    const channelId = channelInfo?._id;
    const permanentPlaylist = channelInfo?.permanentPlaylist;

    if (currentPath === "/") return setSidebarActivity(activeOn.isHome);
    if (currentPath === "/subs")
      return setSidebarActivity(activeOn.isSubscriptionVideos);
    if (currentPath === "/settings")
      return setSidebarActivity(activeOn.isSettings);
    if (currentPath === `/channel/${channelId}`)
      return setSidebarActivity(activeOn.isProfile);
    if (currentPath === `/channel/${channelId}/playlist`)
      return setSidebarActivity(activeOn.isPlaylist);

    if (playlistId) {
      if (
        playlistId?.toString() === permanentPlaylist?.watchHistory?.toString()
      )
        return setSidebarActivity(activeOn.isWatchHistory);

      if (playlistId?.toString() === permanentPlaylist?.watchLater?.toString())
        return setSidebarActivity(activeOn.isWatchLater);

      if (playlistId?.toString() === permanentPlaylist?.likedVideos?.toString())
        return setSidebarActivity(activeOn.isLikedVideos);
    }

    setSidebarActivity(null);
  }, [currentPath, playlistId]);
};

export const useUrlChcek = () => {
  const currentPath = useLocation().pathname;
  const params = useParams();
  const { videoId, channelId } = params;

  const isVideoPlayer = currentPath == `/video-player/${videoId}`;

  const isChannelVideos = currentPath == `/channel/${channelId}`;
  const isChannelPlaylist = currentPath == `/channel/${channelId}/playlist`;

  return { isVideoPlayer, isChannelVideos, isChannelPlaylist };
};

export const useSidebarMode = () => {
  const { bigWindow } = useWindowSize(); // checks if window size is >= 1000px
  const { isVideoPlayer } = useUrlChcek(); // checks if page is video player

  const { isSidebarOpen } = useAppStore();
  const showPermanentSidebar = !(isVideoPlayer | (isSidebarOpen && bigWindow));

  const drawerVariant =
    bigWindow && !isVideoPlayer ? "persistent" : "temporary";

  return { showPermanentSidebar, drawerVariant };
};
