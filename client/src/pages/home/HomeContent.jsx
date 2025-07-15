import { Box, CircularProgress } from "@mui/material";
import axios from "axios";
import { memo, useEffect, useRef, useState } from "react";
import VideoCard from "../../component/cards/VideoCard";
import VideoCardLoading from "../../component/loadingLayouts/VideoCardLoading";
import { GET_HOME_VIDEOS_ROUTE } from "../../utils/constants";

const HomeContent = () => {
  //constants *******************************
  const cursor = useRef(null);
  const hasMore = useRef(true);
  const isFetching = useRef(false);

  // usestate ************************************************************************
  const [videos, setVideos] = useState([]);
  const [isLoading, setisLoading] = useState(false);

  // functions **************************************************************************
  //                  <<----- fetch videos from backend
  const getVideos = async () => {
    if (isFetching.current && !hasMore.current) return;
    try {
      setisLoading(true);
      isFetching.current = true;
      const limit = 20;
      const { data } = await axios.post(
        GET_HOME_VIDEOS_ROUTE,
        { cursor: cursor.current, limit },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      cursor.current = data.nextCursor;
      hasMore.current = data.hasMore;
      setVideos((pre) => [...pre, ...data?.videos]);
    } catch (error) {
      console.log("err in get video", error);
    } finally {
      setisLoading(false);
      isFetching.current = false;
    }
  };

  // use effect **********************************************************************************
  //                   <<----- Fetch data for the first time
  useEffect(() => {
    getVideos();
  }, []);

  //                  <<--- to detect the scroll bar for infinite scrolling **************************
  useEffect(() => {
    const handleScroll = () => {
      const bottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 100;

      if (bottom && !isFetching.current && hasMore.current) {
        getVideos();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isFetching]);

  if (!videos.length && isLoading) return <VideoCardLoading />;
  if (!videos.length && !isLoading) return <EmptyHome />;

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",

          "@media(max-width: 680px)": { justifyContent: "center" },
        }}
      >
        {videos.map((video) => (
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

        {isLoading && <LoadingMoreIndicator />}
      </Box>
    </>
  );
};

export default memo(HomeContent);

const EmptyHome = () => {
  return (
    <div
      style={{
        width: "100%",
        position: "relative",
        padding: "10px",
        // backgroundColor: "yellow",
        height: "40px",
        justifyContent: "center",
        justifyItems: "center",
      }}
    >
      <Box>No videos to show</Box>
    </div>
  );
};

const LoadingMoreIndicator = () => {
  return (
    <div
      style={{
        width: "100%",
        position: "relative",
        padding: "10px",
        height: "40px",
        justifyContent: "center",
        justifyItems: "center",
      }}
    >
      <CircularProgress
        sx={{
          position: "relative",
          left: "50%",
        }}
      />
    </div>
  );
};
