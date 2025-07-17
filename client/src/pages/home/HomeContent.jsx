import { Box, CircularProgress } from "@mui/material";
import axios from "axios";
import { memo } from "react";
import VideoCard from "../../component/cards/VideoCard";
import VideoCardLoading from "../../component/loadingLayouts/VideoCardLoading";
import { useInfinteScroll } from "../../hooks/infinteScrolling";
import { GET_HOME_VIDEOS_ROUTE } from "../../utils/constants";

const fetchVideos = async ({ pageParam = null }) => {
  const limit = 20;
  const { data } = await axios.post(
    GET_HOME_VIDEOS_ROUTE,
    { cursor: pageParam, limit },
    {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return data;
};

const HomeContent = () => {
  const { data, isLoading, isError, isFetchingNextPage } = useInfinteScroll(
    ["homeVideos"],
    fetchVideos
  );
  const allVideos = data?.pages.flatMap((page) => page.videos) || [];

  if (isLoading) return <VideoCardLoading />;
  if (isError)
    return (
      <p className=" py-6 text-center">Error loading videos, Try again.</p>
    );
  if (!allVideos.length)
    return <p className=" py-6 text-center">No Videos to show.</p>;

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          "@media(max-width: 680px)": { justifyContent: "center" },
        }}
      >
        {allVideos.map((video) => (
          <VideoCard
            key={video?._id}
            id={video?._id}
            thumbnail={video?.thumbnailUrl}
            title={video?.title}
            channelId={video?.channel?._id}
            channelName={video?.channel?.channelName}
            views={video?.views}
            uploadTime={video?.createdAt}
            channelProfile={video?.channel?.profilePhoto}
            videoUrl={video?.videoUrl}
            duration={video?.duration}
          />
        ))}

        {isFetchingNextPage && (
          <div className=" w-full py-3 text-center">
            <CircularProgress />
          </div>
        )}
      </Box>
    </>
  );
};

export default memo(HomeContent);
