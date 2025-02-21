import { Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import LongVideoCard from "../component/cards/LongVideoCard";
import axios from "axios";
import { CHANNEL_WATCH_HISTORY } from "../utils/constants";
import { setDefaultOptions } from "date-fns";

const WatchHistory = () => {
  const [historyVideos, setHistoryVideos] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const getWatchHistory = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(CHANNEL_WATCH_HISTORY, {
        withCredentials: true,
      });

      setTotalPages(data?.totalPages);
      setHistoryVideos((pre) => [...pre, ...data?.videos]);
    } catch (err) {
      console.log("erro in history");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
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
        // flexDirection: "column",
        // gap: "6px",
      }}
    >
      <Box
        sx={{
          width: "25%",
        }}
      >
        someting here
      </Box>
      <Box>
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
        {loading &&
          (historyVideos.length
            ? "Loading the history..."
            : "loading more data...")}
        {!loading &&
          (historyVideos.length ? (
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
            </>
          ) : (
            "No Watch history"
          ))}
      </Box>
    </Box>
  );
};

export default WatchHistory;
