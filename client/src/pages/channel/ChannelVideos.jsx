import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import VideoCardLoading from "../../component/LoadingLayouts/VideoCardLoading";
import VideoCard from "../../component/VideoCard";
import { useOutletContext, useParams } from "react-router-dom";
import axios from "axios";
import { GET_CHANNEL_VIDEOS } from "../../utils/constants";

const ChannelVideos = () => {
  //useStates *******************************************************
  const [videos, setVideos] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const params = useParams();
  const { channelId } = params;

  // constants ****************************************************
  const videosRef = useRef(videos);
  const { sort } = useOutletContext();
  useEffect(() => {
    videosRef.current = videos;
  }, [videos.length]);

  // fucntion *******************************************************

  const getVideos = async () => {
    setisLoading(true);
    const pageNumber = Math.ceil(videosRef.current.length / 20) || 0;

    if (pageNumber >= totalPages) {
      console.log("all videos fetched");
      setisLoading(false);
      return;
    }
    try {
      console.log("in try", sort);
      const { data } = await axios.get(
        `${GET_CHANNEL_VIDEOS}/${channelId}?sort=${sort}`,
        {
          withCredentials: true,
        }
      );

      setTotalPages(data.totalPages);
      setVideos((pre) => [...pre, ...data.videos]);
    } catch (error) {
      console.log("something went wrong", error);
    } finally {
      setisLoading(false);
    }
  };
  // useEffect *******************************************************
  let scrollingTimeout;
  useEffect(() => {
    const handleScroll = () => {
      const pageNumber = Math.ceil(videosRef.current.length / 20) || 0;

      if (pageNumber >= totalPages) {
        return;
      }
      const bottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 20;

      if (bottom && !isLoading) {
        // Throttle execution
        if (scrollingTimeout) {
          clearTimeout(scrollingTimeout); // Clear any previous timeout
        }

        scrollingTimeout = setTimeout(() => {
          console.log("at bottom");
          getVideos(sort);
        }, 300); // Execute after 300ms (adjust as needed)
      }
    };
    window.addEventListener("scroll", handleScroll);
  }, [isLoading]);

  // useEffect(() => {
  //   console.log("in contente", sort);
  //   getVideos();
  // }, []);

  useEffect(() => {
    if (sort) {
      setVideos([]);
      videosRef.current = [];
    }
    getVideos(sort);
  }, [sort]);

  return (
    <>
      {!videos.length && isLoading ? (
        <VideoCardLoading />
      ) : (
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
              views={video?.views}
              uploadTime={video?.createdAt}
              videoUrl={video?.videoUrl}
              isInChannel={true}
            />
          ))}
          {isLoading && videos.length && (
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
              <CircularProgress
                sx={{
                  position: "relative",
                  left: "50%",
                }}
              />
            </div>
          )}
          {!isLoading && !videos.length && (
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
              <Box
                sx={{
                  justifyContent: "center",
                }}
              >
                No videos to show
              </Box>
            </div>
          )}
        </Box>
      )}
    </>
  );
};

export default ChannelVideos;
