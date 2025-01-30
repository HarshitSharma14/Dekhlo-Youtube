import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAppStore } from "../../store";
import { Box, CircularProgress } from "@mui/material";
import toast from "react-hot-toast";

const ProtectedRoute = ({ children }) => {
  console.log("in ProtectedRoute");
  const { channelInfo } = useAppStore();
  const [toastShown, setToastShown] = useState(false);

  const isLoggedIn = !!channelInfo;

  if (channelInfo === undefined) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isLoggedIn) {
    if (!toastShown) {
      toast.error("Log in to access that page");
      setToastShown(true); // Prevent multiple toasts
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
