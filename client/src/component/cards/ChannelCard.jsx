import React, { useState } from "react";
import { Box, Typography, Avatar, Button, useMediaQuery } from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { ButtonForCreatorSupport } from "../../pages/channel/ChannelLayout";

const ChannelCard = ({
  isbell,
  channelId,
  bio,
  channelName,
  profilePhoto,
  subsCount,
  email,
}) => {
  const navigate = useNavigate();
  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 2,
          borderRadius: 2,
          // backgroundColor: "#181818",
          // bgcolor: "yellow",
          height: "140px",
          color: "white",
          width: "100%",
          maxWidth: 1000,
        }}
      >
        {/* Profile Avatar */}
        <Avatar
          onClick={() => navigate(`/channel/${channelId}`)}
          src={profilePhoto}
          alt="Chai aur Code"
          sx={{ width: 120, height: 120, cursor: "pointer" }}
        />

        {/* Channel Info */}
        <Box
          onClick={() => navigate(`/channel/${channelId}`)}
          sx={{ flex: 1, cursor: "pointer" }}
        >
          <Typography variant="h6" fontWeight="bold" color="gray">
            {channelName}
          </Typography>
          <Typography
            variant="body2"
            color="gray"
            sx={{
              "@media (max-width: 466px)": {
                fontSize: "12px",
              },
            }}
          >
            {email} • {subsCount} subs
          </Typography>
          <Typography
            variant="body2"
            color="gray"
            sx={{
              wordBreak: "break-word",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              mt: 0.5,
              "@media (max-width: 466px)": {
                fontSize: "12px",
              },
            }}
          >
            {bio}
          </Typography>
        </Box>
        <ButtonForCreatorSupport
          button={1} // one is set for subscribe button in the componenet
          isSubscribedInitially={true}
          isBellInitially={isbell}
          channelId={channelId}
        />
      </Box>
    </>
  );
};

export default ChannelCard;
