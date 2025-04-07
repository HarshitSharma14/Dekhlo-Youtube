import React, { useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useNavigate } from "react-router-dom";
import { VideoLibrary } from "@mui/icons-material";
import pic from "/assets/emptyPlaylist.jpg";

const PlaylistCard = ({
  playlistId,
  title,
  videoCount,
  videoId,
  mainThumbnail,
  secondaryThumbnails = [],
}) => {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  console.log("in pl card", mainThumbnail);
  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        position: "relative",
        width: { xs: "95%", sm: "45%", md: "30%", lg: "23%" },
        margin: "12px",
        borderRadius: "10px",
        overflow: "hidden",
        backgroundColor: "#121212",
        cursor: "pointer",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "@media (max-width: 400px)": {
          width: "100%",
          margin: "4px 0",
          borderRadius: "0",
        },
      }}
      onClick={() => {
        if (videoCount)
          navigate(`/video-player/${videoId}?playlist=${playlistId}`);
      }}
    >
      {/* Main Thumbnail */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: "16/9",
        }}
      >
        <Box
          component="img"
          src={mainThumbnail ? mainThumbnail : pic}
          alt={title}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "10px",
            "@media (max-width: 400px)": {
              borderRadius: "0",
            },
          }}
        />
        <Typography
          variant="caption"
          sx={{
            position: "absolute",
            left: "6%",
            bottom: "6%",
            backgroundColor: "rgba(0, 0, 0, 0.7)", // Semi-transparent black background
            padding: "4px 8px", // Add some padding for better spacing
            borderRadius: "4px", // Rounded corners
            color: "#fff", // White text color
            display: "flex", // To align the icon and text
            alignItems: "center", // Vertically align the text and icon
            fontSize: {
              xs: "0.75rem", // 12px on smaller screens
              sm: "0.85rem", // 13.6px on small screens
              md: "0.875rem", // 14px on medium screens
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <VideoLibrary sx={{ fontSize: "1rem" }} /> {/* Icon */}
            {videoCount} videos
          </Box>
        </Typography>
        {/* Hover Overlay (Only over thumbnail) */}
        <Box
          className="hover-overlay"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            opacity: hovered && videoCount ? 1 : 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: "3",
            transition: "opacity 0.3s ease",
          }}
        >
          <Box
            sx={{
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <PlayArrowIcon />
            <Typography sx={{ fontSize: "16px" }}>Play All</Typography>
          </Box>
        </Box>

        {/* Stacked Thumbnails */}
        <Box
          sx={{
            position: "absolute",
            bottom: "-10px", // Slightly below the main thumbnail
            right: "10px",
            display: "flex",
            width: "20%",
            height: "20%",
            gap: "4px",
            zIndex: 2,
          }}
        >
          {secondaryThumbnails.slice(1, 3).map((card, index) => (
            <Box
              key={index}
              sx={{
                width: "100%",
                height: "100%",
                borderRadius: "5px",
                overflow: "hidden",
                transform: `translateY(${(index + 1) * -10}px) translateX(${-index * 10
                  }px)`,
                position: "absolute",
                right: "0",
                bottom: "10px",
                boxShadow: "0 0  8px 1px #121212",
                zIndex: 2 - index, // Slight stacking effect
              }}
            >
              <Box
                component="img"
                src={card.thumbnailUrl}
                alt={"image"}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </Box>
          ))}
        </Box>
      </Box>

      {/* Card Info */}
      <Box
        sx={{
          padding: "10px",
          backgroundColor: "#121212",
          color: "#ffffff",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontSize: "16px",
            fontWeight: "bold",
            lineHeight: 1.4,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {title?.length ? title : "Untitled"}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontSize: "14px",
            color: "#aaaaaa",
            marginTop: "4px",
            display: "inline-block",
            cursor: "pointer",
            ":hover": {
              color: "white",
            },
          }}
          onClick={(e) => {
            e.stopPropagation(); // Prevents the card click event
            navigate(`/playlist?playlistId=${playlistId}`);
          }}
        >
          View full playlist
        </Typography>
      </Box>
    </Box>
  );
};

export default PlaylistCard;
