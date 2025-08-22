import { Box, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import api from "../../utils/api.js";
import ChannelCard from "../../component/cards/ChannelCard";
import { GET_SUBSCRIBED_CHANNEL } from "../../utils/constants";

const getSubscribedChannel = async () => {
  const { data } = await api.get(GET_SUBSCRIBED_CHANNEL);
  return data.following;
};

const ChannelsSubscribed = () => {
  const {
    data: followings = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["SubscribedChannels"],
    queryFn: getSubscribedChannel,
  });

  if (isLoading)
    return <Box> Loading your subscribed channels please wait... </Box>;
  if (isError)
    return (
      <div>{error.response?.data?.message || "Something went wrong"} </div>
    );
  if (!followings.length)
    return <Box>Your Subscribed channels will show here</Box>;

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
          {followings?.map((following) => {
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
    </Box>
  );
};

export default ChannelsSubscribed;
