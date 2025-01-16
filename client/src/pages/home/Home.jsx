import React, { useEffect, useRef, useState } from "react";

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
import { Button } from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "../../component/Header";
import Siderbar from "../../component/Siderbar";
import "./Home.css";

const Home = () => {
  // useStates ************************************************************************
  const [isHome, setIsHome] = useState(false);
  const [bigWindow, setBigWindow] = useState(false);
  const [open, setOpen] = useState(false);

  // constants *************************************************************************
  const location = useLocation();
  const sidebarRef = useRef(null);

  //useEffect **********************************************************************

  //              <<-- checking for the home route to drill prop in sidebar
  useEffect(() => {
    if (location.pathname == "/") setIsHome(true);
    else setIsHome(false);

    return () => {
      setIsHome(false);
    };
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

  return (
    <div className="app-container">
      <Header />
      <div className="main-layout">
        <aside
          className="sidebar "
          ref={sidebarRef}
          style={{
            alignItems: "center",
          }}
        >
          {(!open || !bigWindow || !isHome) && <PermanentSideBar />}
          {open && <Siderbar isHome={isHome} open={open} func={setOpen} />}
        </aside>
        {/* temp button to open sidebare  */}
        <Button
          onClick={(e) => {
            e.preventDefault();
            setOpen(true);
          }}
        >
          click
        </Button>

        {/* Main content of the pages starts here */}
        <main className="main-content ">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Home;

// component for side bar buttons *************************
const PermanentSideBar = () => {
  // useStates ************************************************************************
  const [isHome, setIsHome] = useState(false);
  const [isSubscription, setIsSubscription] = useState(false);
  const [isProfile, setIsProfile] = useState(false);
  const [isWatchHistory, setIsWatchHistory] = useState(false);

  // useEffect ************************************************************************
  useEffect(() => {
    //   *************************************************************  <<--- check linkes in use state and navigate bellow
    if (location.pathname == "/") setIsHome(true);
    else if (location.pathname == "/profile") setIsProfile(true);
    else if (location.pathname == "/subs") setIsSubscription(true);
    else if (location.pathname == "/history") setIsWatchHistory(true);

    return () => {
      setIsHome(false);
      setIsProfile(false);
      setIsSubscription(false);
      setIsWatchHistory(false);
    };
  }, [location.pathname]);

  return (
    <>
      <SidebarNavigatioButtons
        isFilled={isHome}
        filledIcon={<HomeIcon />}
        outlineIcon={<HomeOutlined />}
        navigateLink={"/"}
        name={"Home"}
      />
      <SidebarNavigatioButtons
        isFilled={isSubscription}
        filledIcon={<SubscriptionsIcon />}
        outlineIcon={<SubscriptionsOutlined />}
        navigateLink={"/subs"}
        name={"Subs"}
      />
      <SidebarNavigatioButtons
        isFilled={isWatchHistory}
        filledIcon={<HistoryIcon />}
        outlineIcon={<HistoryOutlined />}
        navigateLink={"/history"}
        name={"History"}
      />
      <SidebarNavigatioButtons
        isFilled={isProfile}
        filledIcon={<AccountCircleIcon />}
        outlineIcon={<AccountCircleOutlined />}
        navigateLink={"/profile"}
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
  // constants *******************************************
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
      }}
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
