import { Box, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import LongVideoCard from "../../component/cards/LongVideoCard";
import axios from "axios";
import { CHANNEL_WATCH_HISTORY } from "../../utils/constants";
import PlaylistSideArea from "../../component/PlaylistSideArea";

const WatchHistory = () => {
  // useState ********************************************************************************************
  const [historyVideos, setHistoryVideos] = useState([]);
  const [totalPages, setTotalPages] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // useRef **********************************************************************************************
  const isFetching = useRef(null); // I am using this for my infinte scrolling, as its .current values changes instantly as i change them but it does not cause a rerender, also it persists throughout every render

  // functions ***********************************************************************************************
  const getWatchHistory = async () => {
    if (currentPage > totalPages) return;
    setLoading(true);
    isFetching.current = true;
    try {
      const { data } = await axios.get(
        `${CHANNEL_WATCH_HISTORY}?page=${currentPage}&limit=20`,
        {
          withCredentials: true,
        }
      );
      setCurrentPage(currentPage + 1);
      setTotalPages(data?.totalPages);
      setHistoryVideos((pre) => [...pre, ...data?.videos]);
    } catch (err) {
      console.log("erro in history");
      console.log(err);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  // useEffects ***********************************************************************************************************
  useEffect(() => {
    const handleScroll = () => {
      const bottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 100;

      if (!isFetching.current && bottom) {
        console.log("in condition");
        getWatchHistory();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [currentPage]);

  useEffect(() => {
    getWatchHistory();
    return () => {
      setHistoryVideos([]);
    };
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        "@media (max-width:900px)": {
          flexDirection: "column",
        },
      }}
    >
      <Box
        sx={{
          width: "500px",
          "@media (max-width:900px)": {
            width: "100%",
          },
        }}
      >
        <PlaylistSideArea history={true} />
      </Box>
      <Box
        sx={{
          width: "100%",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            padding: "5px 20px",
            fontWeight: "bold",
            color: "#c1c1c1",
            margin: "6px 0",
          }}
        >
          Watch Hisotry
        </Typography>
        {loading && !historyVideos.length && "Loading ..."}

        {historyVideos.length ? (
          <>
            {historyVideos?.map((video, index) => {
              return (
                <LongVideoCard
                  key={index}
                  remove={"Remove from Watch histor"}
                  video={video}
                />
              );
            })}
            {loading && <>Loading more videos...</>}
          </>
        ) : (
          "No Videos to Show"
        )}
      </Box>
    </Box>
  );
};

export default WatchHistory;
