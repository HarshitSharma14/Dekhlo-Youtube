import { Box, Button, Drawer, Menu } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store";
import "./Sidebar.css";

import {
  AccountCircle,
  AccountCircleOutlined,
  FormatListBulleted as FormatListBulletedIcon,
  FormatListBulletedOutlined,
  History as HistoryIcon,
  HistoryOutlined,
  HomeRounded as HomeIcon,
  HomeOutlined,
  PlaylistPlay as PlaylistPlayIcon,
  PlaylistPlayOutlined,
  Settings,
  SubscriptionsRounded as SubscriptionsIcon,
  SubscriptionsOutlined,
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined,
  WatchLater as WatchLaterIcon,
  WatchLaterOutlined,
} from "@mui/icons-material";
const Sidebar = ({ isVideoPlayer }) => {
  //                                 <<-- open and func are temp, will be removed by redux

  // useState *******************************************************************************
  const [drawerVariant, setDrawerVariant] = useState("persistent");

  // constants *******************************************************************************
  const sidebarRef = useRef(null);
  const { isSidebarOpen, toggelSidebar, sidebarActivity, channelInfo } =
    useAppStore();
  // useEffects ********************************************************************************

  //                  <<-- Always render the Sidebar to avoid the flash effect seeming a component mount time taken not neccessory after use of zustang
  // useEffect(() => {
  //   setIsDrawerOpen(open);
  // }, [isSidebarOpen]);

  //                   <<-- Checking widnow size to show suitabel side bar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1000 && !isVideoPlayer) {
        setDrawerVariant("persistent");
      } else {
        setDrawerVariant("temporary");
      }
    };
    // Set initial variant based on window size
    handleResize();
    // Attach the resize event listener
    window.addEventListener("resize", handleResize);

    // Cleanup the event listener on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isSidebarOpen]);

  //                      <<--- (using gpt) ignoring the scroll input in the sidebar after its complition (at top and bottom) so that it doesnt interfear with main page's scroll bar
  useEffect(() => {
    const sidebar = sidebarRef.current;

    const preventScrollPropagation = (e) => {
      const { scrollTop, scrollHeight, clientHeight } = sidebar;
      const atTop = scrollTop === 0;
      const atBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight;

      if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
        e.preventDefault();
      } else {
        // Allow normal scrolling within the sidebar
        sidebar.scrollTop += e.deltaY;
      }
    };

    if (sidebar) {
      sidebar.addEventListener("wheel", preventScrollPropagation, {
        passive: false,
      });
    }

    return () => {
      if (sidebar) {
        sidebar.removeEventListener("wheel", preventScrollPropagation);
      }
    };
  }, []);
  console.log("sidebar ", drawerVariant);
  return (
    <>
      <Drawer
        variant={drawerVariant}
        open={isSidebarOpen}
        onClose={() => {
          toggelSidebar();
        }}
        sx={{
          display: drawerVariant === "persistent" && !isSidebarOpen && "none",
          // display: isSidebarOpen ? "block" : "none",
          width: "250px",
          height: "calc(100vh - 70px)",
          top: "70px",

          "& .MuiDrawer-paper": {
            width: "250px",
            background: "#121212",
            height: "calc(100vh - 70px)",
            position: "relative",
          },
        }}
      >
        <Box
          ref={sidebarRef}
          sx={{
            p: 2,
            color: "white",
            overflowY: "auto", // Ensure vertical scrolling is enabled
            height: "100%",
          }}
        >
          <div className="section top-section">
            <SidebarNavigatioButtons
              isFilled={sidebarActivity.isHome}
              filledIcon={<HomeIcon />}
              outlineIcon={<HomeOutlined />}
              navigateLink={"/"}
              name={"Home"}
              drawerVariant={drawerVariant}
            />
            <SidebarNavigatioButtons
              isFilled={sidebarActivity.isSubscriptionVideos}
              filledIcon={<SubscriptionsIcon />}
              outlineIcon={<SubscriptionsOutlined />}
              navigateLink={"/subs"}
              name={"Subs"}
              drawerVariant={drawerVariant}
            />
          </div>
          <div className="section you-section">
            <p>You</p>
            <SidebarNavigatioButtons
              isFilled={sidebarActivity.isWatchHistory}
              filledIcon={<HistoryIcon />}
              outlineIcon={<HistoryOutlined />}
              navigateLink={`/playlist?playlistId=${channelInfo?.permanentPlaylist?.watchHistory}`}
              name={"History"}
              drawerVariant={drawerVariant}
            />
            <SidebarNavigatioButtons
              isFilled={sidebarActivity.isPlaylist}
              filledIcon={<PlaylistPlayIcon />}
              outlineIcon={<PlaylistPlayOutlined />}
              navigateLink={`/channel/${channelInfo?._id}/playlist`}
              name={"Playlist"}
              drawerVariant={drawerVariant}
            />
            <SidebarNavigatioButtons
              isFilled={sidebarActivity.isWatchLater}
              filledIcon={<WatchLaterIcon />}
              outlineIcon={<WatchLaterOutlined />}
              navigateLink={`/playlist?playlistId=${channelInfo?.permanentPlaylist?.watchLater}`}
              name={"Watch Later"}
              drawerVariant={drawerVariant}
            />
            <SidebarNavigatioButtons
              isFilled={sidebarActivity.isLikedVideos}
              filledIcon={<ThumbUpIcon />}
              outlineIcon={<ThumbUpOutlined />}
              navigateLink={`/playlist?playlistId=${channelInfo?.permanentPlaylist?.likedVideos}`}
              name={"Liked Videos"}
              drawerVariant={drawerVariant}
            />
          </div>
          <div
            className="section subscription-section"
            style={{ border: "none" }}
          >
            <p>Others</p>
            <SidebarNavigatioButtons
              isFilled={sidebarActivity.isProfile}
              filledIcon={<AccountCircle />}
              outlineIcon={<AccountCircleOutlined />}
              navigateLink={
                channelInfo ? `/channel/${channelInfo?._id}` : "/signup"
              }
              name={"You"}
              drawerVariant={drawerVariant}
            />

            <SidebarNavigatioButtons
              isFilled={sidebarActivity.isSettings}
              filledIcon={<Settings />}
              outlineIcon={<Settings />}
              navigateLink={"/settings"}
              name={"Settings"}
              drawerVariant={drawerVariant}
            />
          </div>
          {/* <div className="section setting-section" style={{ border: "none" }}>
         
        </div> */}
          {/* <div></div>
        <div></div> */}
        </Box>
      </Drawer>
    </>
  );
};

export default Sidebar;

const SidebarNavigatioButtons = ({
  name,
  filledIcon,
  outlineIcon,
  navigateLink,
  isFilled,
  drawerVariant,
}) => {
  // constants *******************************************
  const navigate = useNavigate();
  const { toggelSidebar } = useAppStore();

  const sidebarIconsStyleConfig = {
    width: "25px",
    height: "25px",
    mb: "3px",
    color: "white",
  };
  const sidebarButtonStyleConfig = {
    color: "#b3b3b3",
    display: "flex",
    borderRadius: "10px",
    justifyContent: "flex-start",
    alignContent: "center",
    alignItems: "center",
    gap: "30px",
    width: "100%",
    height: "40px",
    mb: "1px",
    bgcolor: isFilled ? "#272727" : "transparent",
    "&: hover": {
      bgcolor: "#3a3a3a", // Hover background color (you can choose any color)
    },
  };
  const sidebarButtonNamesStyleConfig = {
    fontSize: "13px",
    fontWeight: "500",
    color: "white",
  };

  return (
    <Button
      onClick={() => {
        navigate(navigateLink);
        if (drawerVariant === "temporary") toggelSidebar();
      }}
      sx={sidebarButtonStyleConfig}
    >
      {isFilled
        ? React.cloneElement(filledIcon, {
            sx: sidebarIconsStyleConfig,
          })
        : React.cloneElement(outlineIcon, { sx: sidebarIconsStyleConfig })}
      <p style={sidebarButtonNamesStyleConfig}>{name}</p>
    </Button>
  );
};
