import React from "react";
import { Box, Card, CardContent, Skeleton, Typography } from "@mui/material";

const CardSkeleton = () => {
  return (
    <Card
      sx={{
        width: 300,
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",

        "@media (max-width: 390px)": {
          width: 400,
        },
      }}
    >
      <Skeleton
        variant="rectangular"
        width="100%"
        height={160}
        sx={{ borderRadius: 0 }}
      />

      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Skeleton variant="circular" width={50} height={50} />

        <Box sx={{ flex: 1 }}>
          <Typography variant="h5">
            <Skeleton width="80%" />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <Skeleton width="60%" />
          </Typography>
        </Box>
      </CardContent>

      {/* Additional Content Placeholder */}
    </Card>
  );
};

const VideoCardLoading = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        justifyContent: "center",
      }}
    >
      {/* Render multiple skeletons */}
      {Array.from(new Array(12)).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </Box>
  );
};
export default VideoCardLoading;
