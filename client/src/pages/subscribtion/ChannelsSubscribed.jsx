import { Box, Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { GET_SUBSCRIBED_CHANNEL } from "../../utils/constants";
import ChannelCard from "../../component/cards/ChannelCard";

const ChannelsSubscribed = () => {
  const [followings, setFollowings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const getSubscribedChannel = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(GET_SUBSCRIBED_CHANNEL, {
        withCredentials: true,
      });
      console.log("subs", data);
      setFollowings(data.following);
    } catch (err) {
      console.log("error", err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getSubscribedChannel();
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pb: "10px",
        width: "100%",
      }}
    >
      {isLoading && (
        <Box> Loading your subscribed channels please wait... </Box>
      )}
      {!isLoading && followings.length ? (
        <>
          <Box
            sx={{
              width: "100%",
              "@media (min-width: 730px)": {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              },
            }}
          >
            <Typography
              variant="h4"
              sx={{
                padding: "5px 20px",
                fontWeight: "bold",
                color: "#c1c1c1",
                mt: "4px",
              }}
            >
              All Subscriptions
            </Typography>
            {followings.map((following) => {
              return (
                <ChannelCard
                  isbell={following?.bell}
                  channelId={following?.creator?._id}
                  bio={following?.creator?.bio}
                  channelName={following?.creator?.channelName}
                  profilePhoto={following?.creator?.profilePhoto}
                  subsCount={following?.creator?.subscribersCount}
                  email={following?.creator?.email}
                />
              );
            })}
          </Box>
        </>
      ) : (
        <></>
      )}

      {!isLoading && !followings.length && (
        <>
          <Box>Your Subscribed channels will show here</Box>
        </>
      )}
    </Box>
  );
};

export default ChannelsSubscribed;
