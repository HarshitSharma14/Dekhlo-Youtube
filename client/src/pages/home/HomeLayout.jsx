import React, { useEffect, useRef, useState } from "react";

import {
  AccountCircleRounded as AccountCircleIcon,
  AccountCircleOutlined,
  History as HistoryIcon,
  HistoryOutlined,
  HomeRounded as HomeIcon,
  HomeOutlined,
  Menu as MenuIcon,
  SubscriptionsRounded as SubscriptionsIcon,
  SubscriptionsOutlined,
} from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../../component/Header";
import Siderbar from "../../component/Siderbar";
import { useAppStore } from "../../store";
import "./HomeLayout.css";
import { LoaderIcon } from "react-hot-toast";

const HomeLayout = () => {
  // console.log("home");
  // useStates ************************************************************************
  const [isVideoPlayer, setIsVideoPlayer] = useState(true);
  const [bigWindow, setBigWindow] = useState(false);

  // constants *************************************************************************
  const location = useLocation();
  const sidebarRef = useRef(null);
  const { isSidebarOpen, toggelSidebar, channelInfo } = useAppStore();
  const params = useParams();
  const { videoId } = params;
  // const location = useLocation();
  const { setSidebarActivity } = useAppStore();
  const activeOn = {
    isHome: "isHome",
    isSubscriptionVideos: "isSubscriptionVideos",
    isProfile: "isProfile",
    isWatchHistory: "isWatchHistory",
    isWatchLater: "isWatchLater",
    isPlaylist: "isPlaylist",
    isLikedVideos: "isLikedVideos",
    isSubscriptionChannels: "isSubscriptionChannels",
    isSettings: "isSettings",
  };

  //useEffect **********************************************************************
  //                <<--- Set the sidebar icon to active according to the url page
  useEffect(() => {
    console.log("in home effecct");
    if (location.pathname == "/") setSidebarActivity(activeOn.isHome);
    else if (location.pathname == "/subs")
      setSidebarActivity(activeOn.isSubscriptionVideos);
    else if (location.pathname == "/history")
      setSidebarActivity(activeOn.isWatchHistory);
    else if (
      location.pathname == `/channel/${channelInfo?._id}` ||
      location.pathname == `/channel/${channelInfo?._id}/playlist`
    )
      setSidebarActivity(activeOn.isProfile);
    else setSidebarActivity(null);
  }, [location.pathname]);

  //              <<-- checking for the home route to drill prop in sidebar
  useEffect(() => {
    if (location.pathname == `/video-player/${videoId}`) setIsVideoPlayer(true);
    else setIsVideoPlayer(false);

    // return () => {
    //   setIsVideoPlayer(false);
    // };
  }, [location.pathname]);

  //                 <<-- using the window size to predite whether the permanent sidebar should be disappearing or not
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1000) {
        setBigWindow(true);
      } else {
        setBigWindow(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      setBigWindow(false);
    };
  }, []);

  //                    <<--- (using gpt) ignoring the scroll input in the sidebar after its complition (at top and bottom) so that it doesnt interfear with main page's scroll bar
  useEffect(() => {
    const sidebar = sidebarRef.current;

    const preventScrollPropagation = (e) => {
      const { scrollTop, scrollHeight, clientHeight } = sidebar;
      const atTop = scrollTop === 0;
      const atBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight;

      if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
        e.preventDefault();
      } else {
        sidebar.scrollTop += e.deltaY;
      }
    };

    sidebar.addEventListener("wheel", preventScrollPropagation, {
      passive: false,
    });

    return () => {
      sidebar.removeEventListener("wheel", preventScrollPropagation);
    };
  }, []);

  const containerRef = useRef(null);
  useEffect(() => {
    const handleScroll = () => {
      const element = containerRef.current;
      if (element) {
        const isAtBottom =
          element.scrollHeight - element.scrollTop === element.clientHeight;
        if (isAtBottom) {
          console.log("Reached the end of the scroll bar!");
        }
      }
    };
    const element = containerRef.current;
    if (element) {
      element.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (element) {
        element.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  // function for onclick for a video card

  return (
    <>
      <Box
        sx={{
          display: bigWindow && !isVideoPlayer && "none",
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
        <div
          className="flex items-center ml-4 "
          style={{
            height: "100%",
          }}
        >
          <button
            onClick={toggelSidebar}
            aria-label="menu"
            className=" text-white hover:bg-gray-700  rounded-full w-10 h-10"
          >
            <MenuIcon fontSize="medium" />
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-[123px] h-[56px] cursor-default text-white font-bold text-2xl"
          >
            <span className="yt-icon-shape flex justify-center items-center">
              <img src="../../assets/logo.png" className="w-[93px] h-[20px]" />
            </span>
          </button>
        </div>
      </Box>
      <div className="app-container" ref={containerRef}>
        <Header isDisabled={false} />
        <div className="main-layout">
          <aside
            className="sidebar "
            ref={sidebarRef}
            style={{
              alignItems: "center",
            }}
          >
            {!isVideoPlayer && (!isSidebarOpen || !bigWindow) && (
              <PermanentSideBar />
            )}

            {/* Always render the Sidebar to avoid the flash effect seeming a component mount time taken */}

            <Siderbar isVideoPlayer={isVideoPlayer} />
          </aside>

          {/* Main content of the pages starts here */}
          <main
            className="main-content"
            style={{
              paddingBottom: "10px",
            }}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default HomeLayout;

// component for side bar buttons *************************
const PermanentSideBar = () => {
  // useStates ************************************************************************
  const [isHome, setIsHome] = useState(false);
  const [isSubscription, setIsSubscription] = useState(false);
  const [isProfile, setIsProfile] = useState(false);
  const [isWatchHistory, setIsWatchHistory] = useState(false);

  // constants **************************************************************************
  const { isSidebarOpen, toggelSidebar, sidebarActivity, channelInfo } =
    useAppStore();
  const activeOn = {
    isHome: "isHome",
    isSubscriptionVideos: "isSubscriptionVideos",
    isProfile: "isProfile",
    isWatchHistory: "isWatchHistory",
  };

  // useEffect ************************************************************************

  return (
    <>
      <SidebarNavigatioButtons
        isFilled={sidebarActivity.isHome}
        filledIcon={<HomeIcon />}
        outlineIcon={<HomeOutlined />}
        navigateLink={"/"}
        name={"Home"}
        activeOn={activeOn.isHome}
      />
      <SidebarNavigatioButtons
        isFilled={sidebarActivity.isSubscriptionVideos}
        filledIcon={<SubscriptionsIcon />}
        outlineIcon={<SubscriptionsOutlined />}
        navigateLink={"/subs"}
        name={"Subs"}
        activeOn={activeOn.isSubscriptionVideos}
      />
      <SidebarNavigatioButtons
        isFilled={sidebarActivity.isWatchHistory}
        filledIcon={<HistoryIcon />}
        outlineIcon={<HistoryOutlined />}
        navigateLink={"/history"}
        name={"History"}
        activeOn={activeOn.isWatchHistory}
      />
      <SidebarNavigatioButtons
        isFilled={sidebarActivity.isProfile}
        filledIcon={<AccountCircleIcon />}
        outlineIcon={<AccountCircleOutlined />}
        navigateLink={channelInfo ? `/channel/${channelInfo?._id}` : "/signup"}
        name={"You"}
        activeOn={activeOn.isProfile}
      />
    </>
  );
};

const SidebarNavigatioButtons = ({
  name,
  filledIcon,
  outlineIcon,
  navigateLink,
  activeOn,
  isFilled,
}) => {
  // constants *******************************************
  const { setSidebarActivity } = useAppStore();

  const navigate = useNavigate();
  const iconStyle = {
    width: "30px",
    height: "30px",
    mb: "3px",
  };

  return (
    <Button
      onClick={() => {
        navigate(navigateLink);
        // setSidebarActivity(activeOn);
      }}
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
  );
};
