import React from "react";

import {
  AccountCircleOutlined,
  HistoryOutlined,
  HomeOutlined,
  SubscriptionsOutlined,
} from "@mui/icons-material";
import { CircularProgress, Box, Typography } from "@mui/material";
import { Button } from "@mui/material";
import "./LoadingPage.css";
import Header from "./Header";

const LoadingPage = () => {
  console.log("home");

  // constants *************************************************************************

  //useEffect **********************************************************************

  return (
    <div className="app-container">
      <Header disabled={true} />
      <div className="main-layout">
        <aside
          className="sidebar "
          style={{
            alignItems: "center",
          }}
        >
          <PermanentSideBar />
        </aside>

        <main
          className="main-content"
          //   style={{ borderLeft: "1px solid #b3b3b3" }}
        >
          <Box
            sx={{
              position: "relative",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              //   backgroundColor: "rgba(255, 255, 255, 0.9)", // Optional overlay effect
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {/* MUI Circular Progress Spinner */}
              <CircularProgress size={40} />
              <Typography variant="h6" sx={{ marginTop: 2 }}>
                Loading...
              </Typography>
            </Box>
          </Box>
        </main>
      </div>
    </div>
  );
};

export default LoadingPage;

// component for side bar buttons *************************
const PermanentSideBar = () => {
  return (
    <>
      <SidebarNavigatioButtons outlineIcon={<HomeOutlined />} name={"Home"} />
      <SidebarNavigatioButtons
        outlineIcon={<SubscriptionsOutlined />}
        name={"Subs"}
      />
      <SidebarNavigatioButtons
        outlineIcon={<HistoryOutlined />}
        name={"History"}
      />
      <SidebarNavigatioButtons
        outlineIcon={<AccountCircleOutlined />}
        name={"You"}
      />
    </>
  );
};

const SidebarNavigatioButtons = ({ name, outlineIcon }) => {
  const iconStyle = {
    width: "30px",
    height: "30px",
    mb: "3px",
  };
  return (
    <Button
      disabled={true}
      sx={{
        color: "#b3b3b3",
        display: "flex",
        flexDirection: "column",
        borderRadius: "10px",
        height: "75px",
        m: "0 4px",
        mb: "4px",
      }}
    >
      {React.cloneElement(outlineIcon, { sx: iconStyle })}
      <p
        style={{
          fontSize: "9px",
          fontWeight: "lighter",
          color: "#b3b3b3",
        }}
      >
        {name}
      </p>
    </Button>
  );
};
