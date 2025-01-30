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

  // constants ****************************************************
  const params = useParams();
  const { channelId } = params;
  const videosRef = useRef(videos);
  const { sort } = useOutletContext();
  useEffect(() => {
    videosRef.current = videos;
  }, [videos.length]);

  // fucntion *******************************************************
  const getVideos = async (sorts) => {
    if (isLoading) return;
    setisLoading(true);
    const pageNumber = Math.ceil(videosRef.current.length / 20) || 0;

    if (pageNumber >= totalPages) {
      console.log("all videos fetched");
      setisLoading(false);
      return;
    }
    try {
      console.log("in try", sorts);
      const { data } = await axios.get(
        `${GET_CHANNEL_VIDEOS}/${channelId}?page=${pageNumber}&sort=${sorts}`,
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
  const scrollingTimeoutRef = useRef(null);
  useEffect(() => {
    const handleScroll = () => {
      const pageNumber = Math.ceil(videosRef.current.length / 20) || 0;

      if (pageNumber >= totalPages) {
        return;
      }
      const bottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 20;

      if (bottom) {
        // Throttle execution
        if (scrollingTimeoutRef.current) {
          clearTimeout(scrollingTimeoutRef.current); // Clear any previous timeout
        }

        scrollingTimeoutRef.current = setTimeout(() => {
          console.log("at bottom");
          getVideos(sort);
        }, 300); // Execute after 300ms (adjust as needed)
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoading, sort]);

  useEffect(() => {
    setVideos([]);
    videosRef.current = [];

    getVideos(sort);
  }, [sort]);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          "@media(max-width: 680px)": { justifyContent: "center" },
        }}
      >
        {!videos.length && isLoading ? (
          <VideoCardLoading />
        ) : (
          <>
            {" "}
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
          </>
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
    </>
  );
};

export default ChannelVideos;
