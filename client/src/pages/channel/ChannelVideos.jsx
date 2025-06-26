import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import VideoCardLoading from "../../component/loadingLayouts/VideoCardLoading";
import VideoCard from "../../component/cards/VideoCard";
import { useOutletContext, useParams } from "react-router-dom";
import axios from "axios";
import { GET_CHANNEL_VIDEOS } from "../../utils/constants";

const ChannelVideos = () => {
  //useStates *******************************************************
  const [videos, setVideos] = useState([]);
  const [isLoading, setisLoading] = useState(false);

  // constants ****************************************************
  const isFetching = useRef(false);
  const cursor = useRef(null);
  const hasMore = useRef(true);
  const params = useParams();
  const { channelId } = params;
  const { sort, isOwner } = useOutletContext();
  console.log("in ch videos ", sort);

  // fucntion *******************************************************
  const getVideos = async () => {
    if (!hasMore.current || isFetching.current) return;
    isFetching.current = true;
    setisLoading(true);
    try {
      // cursor, limit = 20, sortField = "_id", sortOrder = 1
      const { data } = await axios.get(
        `${GET_CHANNEL_VIDEOS}/${channelId}?cursor=${JSON.stringify(
          cursor?.current
        )}&sortField=${sort.sf}&sortOrder=${sort.so}`,
        {
          withCredentials: true,
        }
      );
      hasMore.current = data.hasMore;
      cursor.current = data.nextCursor;
      setVideos((pre) => [...pre, ...data.videos]);
      // setCursor(data.nextCursor);
    } catch (error) {
      console.log("something went wrong", error);
    } finally {
      setisLoading(false);
      isFetching.current = false;
    }
  };
  // useEffect *******************************************************
  const scrollingTimeoutRef = useRef(null);
  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore.current || isFetching.current) return;

      const bottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 20;

      if (bottom) {
        // Throttle execution
        getVideos();
        // if (scrollingTimeoutRef.current) {
        //   clearTimeout(scrollingTimeoutRef.current); // Clear any previous timeout
        // }

        // scrollingTimeoutRef.current = setTimeout(() => {
        //   getVideos(sort);
        // }, 300); // Execute after 300ms (adjust as needed)
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoading, sort]);

  useEffect(() => {
    setVideos([]);
    cursor.current = null;
    hasMore.current = true;
    isFetching.current = false;
    getVideos();
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
                isOwner={isOwner}
                duration={video?.duration}
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
