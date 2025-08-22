import React from "react";

import {
  AccountCircleRounded as AccountCircleIcon,
  AccountCircleOutlined,
  History as HistoryIcon,
  HistoryOutlined,
  HomeRounded as HomeIcon,
  HomeOutlined,
  SubscriptionsRounded as SubscriptionsIcon,
  SubscriptionsOutlined,
} from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import { Link, Outlet } from "react-router-dom";
import Header from "../../component/Header";
import Siderbar from "../../component/Siderbar";
import YoutubeIconSection from "../../component/YoutubeIconSection";
import { useSidebarState } from "../../hooks";
import { useSidebarMode } from "../../hooks/sidebarState";
import { useAppStore } from "../../store";
import "./HomeLayout.css";

const HomeLayout = () => {
  return (
    <div className="app-container">
      <Header isDisabled={false} />

      <div className="main-layout">
        <SidebarsWrapper />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default HomeLayout;

const SidebarsWrapper = () => {
  useSidebarState(); //   Set the sidebar icon to active according to the url page

  const { showPermanentSidebar } = useSidebarMode();

  return (
    <>
      <SidebarDrawerTop />
      <aside className="sidebar ">
        {showPermanentSidebar && <PermanentSideBar />}
        <Siderbar />
      </aside>
    </>
  );
};

const SidebarDrawerTop = () => {
  const { isSidebarOpen } = useAppStore();
  const { drawerVariant } = useSidebarMode();
  return (
    <Box
      sx={{
        display: drawerVariant === "persistent" && "none",
        zIndex: "1201",
        height: "70px",
        width: "250px",
        bgcolor: "#121212",
        position: "fixed",
        left: "-250px",
        top: "0px",
        marginLeft: isSidebarOpen ? "250px" : "0px",
        transition: "margin-left 200ms",
      }}
    >
      <YoutubeIconSection />
    </Box>
  );
};

const PermanentSideBar = () => {
  const { sidebarActivity, channelInfo } = useAppStore();

  return (
    <>
      <SidebarNavigatioButtons
        isFilled={sidebarActivity.isHome}
        filledIcon={<HomeIcon />}
        outlineIcon={<HomeOutlined />}
        navigateLink={"/"}
        name={"Home"}
      />
      <SidebarNavigatioButtons
        isFilled={sidebarActivity.isSubscriptionVideos}
        filledIcon={<SubscriptionsIcon />}
        outlineIcon={<SubscriptionsOutlined />}
        navigateLink={"/subs"}
        name={"Subs"}
      />
      <SidebarNavigatioButtons
        isFilled={sidebarActivity.isWatchHistory}
        filledIcon={<HistoryIcon />}
        outlineIcon={<HistoryOutlined />}
        navigateLink={`/playlist?playlistId=${channelInfo?.permanentPlaylist?.watchHistory}`}
        name={"History"}
      />
      <SidebarNavigatioButtons
        isFilled={sidebarActivity.isProfile}
        filledIcon={<AccountCircleIcon />}
        outlineIcon={<AccountCircleOutlined />}
        navigateLink={channelInfo ? `/channel/${channelInfo?._id}` : "/signup"}
        name={"You"}
      />
    </>
  );
};

const SidebarNavigatioButtons = ({
  name,
  filledIcon,
  outlineIcon,
  navigateLink,
  isFilled,
}) => {
  const iconStyle = {
    width: "30px",
    height: "30px",
    mb: "3px",
  };

  return (
    <Link to={navigateLink}>
      <Button
        sx={{
          color: "#b3b3b3",
          display: "flex",
          flexDirection: "column",
          borderRadius: "10px",
          height: "75px",
          width: "100%",
          m: "0 4px",
          mb: "4px",
        }}
      >
        {isFilled
          ? React.cloneElement(filledIcon, {
              sx: { ...iconStyle, color: "white" },
            })
          : React.cloneElement(outlineIcon, { sx: iconStyle })}
        <p
          style={{
            fontSize: "9px",
            fontWeight: "lighter",
            color: isFilled ? "white" : "#b3b3b3",
          }}
        >
          {name}
        </p>
      </Button>
    </Link>
  );
};
