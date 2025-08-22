import api from "../../utils/api.js";
import React, { useEffect, useRef, useState } from "react";
import { SEARCH_VIDEO_ROUTE } from "../../utils/constants";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import LongVideoCard from "../../component/cards/LongVideoCard";
import { useInfinteScroll } from "../../hooks/infinteScrolling";

const getChannelPlaylists = async ({ pageParam = null, queryKey }) => {
  const [_key, searchText] = queryKey;

  if (!searchText) return { videos: [], hasMore: false, nextCursor: null };

  const cursorParam = pageParam ? `&cursor=${pageParam}` : "";
  const { data } = await api.get(
    `${SEARCH_VIDEO_ROUTE}?s=${searchText}${cursorParam}&limit=20`
  );
  return {
    videos: data?.videos || [],
    hasMore: data?.hasMore || false,
    nextCursor: data?.nextCursor || null,
  };
};

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const searchText = searchParams.get("s");
  console.log("searchText", searchText);
  const navigate = useNavigate();

  const { data, isLoading, isError, error, isFetchingNextPage } =
    useInfinteScroll(["search", searchText], getChannelPlaylists, {
      staleTime: 0, // Data is immediately stale
      gcTime: 0, // Don't cache at all
      refetchOnMount: true, // Always refetch when component mounts
      refetchOnWindowFocus: false, // Don't refetch on window focus
    });

  const videos = data?.pages.flatMap((page) => page.videos) || [];

  const handleVideoClick = (videoId) => {
    navigate(`/video-player/${videoId}`);
  };
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [searchText]);

  // Show no search text message
  if (!searchText) {
    return (
      <div className="max-w-[1200px] mx-auto mt-5">
        <div className="flex justify-center items-center mt-5 text-gray-500">
          Enter a search term to find videos
        </div>
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="max-w-[1200px] mx-auto mt-5">
        <div className="flex justify-center items-center mt-5 text-red-500">
          {error?.response?.data?.message || "Something went wrong, Try again"}
        </div>
      </div>
    );
  }

  // Show no results message
  if (!isLoading && !videos.length) {
    return (
      <div className="max-w-[1200px] mx-auto mt-5">
        <div className="flex justify-center items-center mt-5 text-gray-500">
          No videos found for "{searchText}"
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto mt-5">
      {isLoading && (
        <div className="flex justify-center items-center mt-5">Loading...</div>
      )}

      {videos.map((video, index) => (
        <div
          key={video._id}
          onClick={() => handleVideoClick(video._id)}
          className="cursor-pointer"
        >
          <LongVideoCard video={video} />
        </div>
      ))}

      {isFetchingNextPage && (
        <div className="flex justify-center items-center mt-5">
          Loading more...
        </div>
      )}
    </div>
  );
};

export default SearchPage;
