import { Box, CircularProgress } from "@mui/material";
import axios from "axios";
import { useOutletContext, useParams } from "react-router-dom";
import VideoCard from "../../component/cards/VideoCard";
import VideoCardLoading from "../../component/loadingLayouts/VideoCardLoading";
import { useInfinteScroll } from "../../hooks/infinteScrolling";
import { GET_CHANNEL_VIDEOS } from "../../utils/constants";

const getVideoss = async ({ pageParam = null, queryKey }) => {
  const [_key, channelId, sort] = queryKey;

  const api = `${GET_CHANNEL_VIDEOS}/${channelId}?cursor=${JSON.stringify(
    pageParam
  )}&sortField=${sort.sf}&sortOrder=${sort.so}&limit=20`;

  const { data } = await axios.get(api, {
    withCredentials: true,
  });
  return data;
};

const ChannelVideos = () => {
  const params = useParams();
  const { channelId } = params;
  const { sort, isOwner } = useOutletContext();
  console.log("in ch videos ", sort);

  const { data, isLoading, isError, error, isFetchingNextPage } =
    useInfinteScroll(["channelVideos", channelId, sort], getVideoss);
  const videos = data?.pages.flatMap((page) => page.videos) || [];

  if (isError)
    return (
      <div className=" py-6 text-center">
        {error?.response?.data?.message || "Something went wrong, Try again"}
      </div>
    );
  if (isLoading)
    return (
      <div className=" pt-4">
        <VideoCardLoading />{" "}
      </div>
    );
  if (!videos.length)
    return <div className=" py-6 text-center">No videos to show</div>;

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          "@media(max-width: 680px)": { justifyContent: "center" },
        }}
      >
        {videos?.map((video) => (
          <VideoCard
            key={video?._id}
            id={video?._id}
            thumbnail={video?.thumbnailUrl}
            title={video?.title}
            views={video?.views}
            uploadTime={video?.createdAt}
            videoUrl={video?.videoUrl}
            isInChannel={true}
            isOwner={isOwner}
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

export default ChannelVideos;
