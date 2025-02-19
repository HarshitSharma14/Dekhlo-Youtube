import React, { memo, useEffect, useState } from "react";
import VideoCard from "../../component/cards/VideoCard";
import { Box, CircularProgress } from "@mui/material";
import axios from "axios";
import { GET_HOME_VIDEOS_ROUTE } from "../../utils/constants";
import { useNavigate } from "react-router-dom";
import VideoCardLoading from "../../component/LoadingLayouts/VideoCardLoading";

const HomeContent = () => {
  //constants *******************************
  const navigate = useNavigate();

  // usestate ************************************************************************
  const [videos, setVideos] = useState([]);
  // const [seenIds, setSeenIds] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  // functions **************************************************************************
  //                  <<----- fetch videos from backend
  const getVideos = async () => {
    const pageNumber = Math.ceil(videos.length / 20) || 0;
    const seenIds = videos?.map((vid) => vid._id) || null;

    console.log("total pages", totalPages);
    console.log("pg no ", pageNumber);
    if (pageNumber >= totalPages) {
      console.log("all videos fetched");
      return;
    }
    try {
      console.log("seend", seenIds);
      setisLoading(true);
      const res = await axios.post(
        GET_HOME_VIDEOS_ROUTE,
        { seenIds },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setTotalPages(res.data?.totalPages);
      // console.log(res.data);
      // const newVideoIds = res.data?.videos?.map((vid) => vid._id);
      // setSeenIds((e) => {
      //   const updatedIds = [...e, ...newVideoIds];
      //   return updatedIds;
      // });
      // console.log(...res.data?.videos?.map((vid) => vid._id));
      setVideos((e) => [...e, ...res.data?.videos]);
    } catch (error) {
      console.log("err", error);
    } finally {
      setisLoading(false);
    }
  };

  //                   <<--- Handels the scroll behaviour for the infinete scrolling *****************************
  let scrollingTimeout;
  const handleScroll = () => {
    const bottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 100;

    if (bottom && !isLoading) {
      // Throttle execution
      if (scrollingTimeout) {
        clearTimeout(scrollingTimeout); // Clear any previous timeout
      }

      scrollingTimeout = setTimeout(() => {
        console.log("at bottom");
        getVideos();
      }, 100); // Execute after 300ms (adjust as needed)
    }
  };

  // use effect **********************************************************************************
  //                   <<----- Fetch data for the first time
  useEffect(() => {
    getVideos();
  }, []);

  //                  <<--- to detect the scroll bar for infinite scrolling **************************
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isLoading]);

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
              channelId={video?.channel._id}
              channelName={video?.channel.channelName}
              views={video?.views}
              uploadTime={video?.createdAt}
              channelProfile={video?.channel.profilePhoto}
              videoUrl={video?.videoUrl}
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
              <Box>No videos to show</Box>
            </div>
          )}
        </Box>
      )}
    </>
  );
};

export default memo(HomeContent);
