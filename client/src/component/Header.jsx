import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  InputBase,
  Avatar,
  Button,
  Menu,
  MenuItem,
  useMediaQuery,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from "@mui/icons-material/Menu";
import axios from "axios";
import {
  Search as SearchIcon,
  AddCircle as CreateIcon,
} from "@mui/icons-material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import toast from "react-hot-toast";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AUTOCOMPLETE_ROUTE, GET_NOTIFICATIONS, CHANGE_ISREAD, LOGOUT_ROUTE, SEARCH_VIDEO_ROUTE, UPDATE_VIDEO_INFO } from "../utils/constants";
import { useAppStore } from "../store";
import { Autocomplete, TextField } from "@mui/material";
import Notifications from "./Notifications";
import { useRef } from "react";

const Header = ({ isDisabled }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:768px)");
  const [searchParams] = useSearchParams();
  const s = searchParams.get("s");
  const { channelInfo, setChannelInfo, setIsLoggedIn, setNotifications, clearNotifications, notifications, notificationsPending, setNotificationsPending } = useAppStore()
  const [back, setBack] = useState(false)
  const [searchText, setSearchText] = useState(sessionStorage.getItem("searchText") || s || "")
  const [suggestions, setSuggestions] = useState([])
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  // Toggle the menu (avatar options)
  const dialogRef = useRef(null)
  const handleAvatarClick = (event) => {
    console.log(anchorEl)
    if (anchorEl === null) { setAnchorEl(event.currentTarget); }
    else { setAnchorEl(null); }
  };
  const handleAvatarClose = () => {
    setAnchorEl(null);
  };
  const handleClickOutside = (event) => {
    if (dialogRef.current && !dialogRef.current.contains(event.target)) {
      setAnchorEl(null);
    }
  };
  useEffect(() => {
    if (anchorEl) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [anchorEl]);

  const toggleNotifications = async () => {
    if (notificationsOpen) {
      setNotificationsOpen(false)
    }
    else {
      setNotificationsOpen(true)
      try {
        await axios.get(`${CHANGE_ISREAD}?t=${notifications[0].createdAt}`, { withCredentials: true })
        setNotificationsPending(false)
      }
      catch (e) {
        console.log(e)
      }
    }
  }



  const searchVideo = async (value) => {
    if (value) {
      sessionStorage.setItem("searchText", value);
    }
    else { sessionStorage.setItem("searchText", searchText); }
    navigate(`/search?s=${searchText}`);
    setTimeout(() => {
      navigate(0); // Force page reload (not recommended but works)
    }, 0);
    return
  }

  const fetchAutocomplete = async (text) => {
    try {
      const response = await axios.get(AUTOCOMPLETE_ROUTE, { params: { searchText: text } })
      setSuggestions(response.data.results)
    }
    catch (error) {
      console.log(error)
    }
  }

  const handleChange = (value) => {
    setSearchText(value);

    if (value.length > 1) {
      fetchAutocomplete(value)
    }
    else {
      setSuggestions([])
    }


  }


  useEffect(() => {
    const fetchNoti = async () => {
      try {
        const response = await axios.get(GET_NOTIFICATIONS, { withCredentials: true })

        if (response.data[response.data.length - 1].isRead) {
          setNotificationsPending(false)
        }
        else {
          setNotificationsPending(true)
        }
        if (response.data) {
          clearNotifications()
          response.data.forEach((notification) => {
            setNotifications(notification); // Adds each notification one by one
          });
        }
      }
      catch (e) {
        console.log(e)
      }
    }
    if (channelInfo) fetchNoti()
  }, [])


  const logout = async () => {
    try {
      const toastId = toast.loading("Logging out...");
      const response = await axios.get(LOGOUT_ROUTE, { withCredentials: true })
      if (response.status === 200) {
        toast.success("Logout successful", { id: toastId });
        console.log('logout success')
        setIsLoggedIn(false)
        setChannelInfo(null)
        navigate("/");
      }
      else {
        console.log('error')
      }
    }
    catch (e) {
      console.log(e)
    }
  }

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
      if (window.innerWidth > 650) {
        setBack(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // const clickSmallSearch = async()=>{
  //   if(screenWidth<650){
  //     setBack(true);
  //   }
  // }

  const { toggelSidebar } = useAppStore();

  return (
    <header className="sticky top-0 bg-[#121212] shadow-none h-[70px] z-10">
      <div className="flex h-full px-2 justify-between items-center">
        {/* Left Section: Hamburger Icon & Logo */}
        <div className={`${back ? "hidden" : "flex"} items-center`}>
          <button
            disabled={isDisabled}
            onClick={toggelSidebar}
            aria-label="menu"
            className=" text-white hover:bg-gray-700  rounded-full w-10 h-10"
          >
            <MenuIcon fontSize="medium" />
          </button>
          <button
            disabled={isDisabled}
            onClick={() => {
              navigate("/")
            }}
            className="w-[123px] h-[56px] cursor-default text-white font-bold text-2xl"
          >
            <span className="yt-icon-shape flex justify-center items-center">
              <img src="/assets/logo.png" className="w-[93px] h-[20px]" />
            </span>
          </button>
        </div>
        <div className={`${back ? "flex" : "hidden"}`}>
          <ArrowBackIcon onClick={() => setBack(false)} />
        </div>

        {/* Center Section: Search Bar */}
        <div className={`${back ? "flex ml-[60px] mr-[20px]" : "hidden"} items-center border mr-1 border-s-2 border-[#303030] h-[40px] rounded-3xl w-[600px] max-w-full bg-[#121212] overflow-hidden xs:flex`}>
          {/* <input
            disabled={isDisabled}
            className="flex-1 min-w-[30px] bg-[#121212] text-white px-4 outline-none placeholder-gray-500"
            placeholder="Search"
            onChange={handleChange}
            value={searchText}
          /> */}

          <Autocomplete
            freeSolo
            options={suggestions}
            onChange={(e, value) => {                            // For selection
              if (value) {
                setSearchText(() => value);
                searchVideo(value)
                // Trigger search only on selection
              }
            }}
            className="flex-1 min-w-[30px] bg-[#121212] text-white px-4 outline-none placeholder-gray-500"
            onInputChange={(e, value) => {
              handleChange(value);
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                border: "none",                      // ✅ Remove border
                "& fieldset": { border: "none" },   // ✅ Remove default fieldset border
                backgroundColor: "transparent"       // ✅ Transparent background
              },
              "& .MuiAutocomplete-option:hover": {       // 🎯 Hover Effect
                backgroundColor: "rgba(0, 123, 255, 0.1)",
                color: "blue",
                fontWeight: "bold"
              },
              border: "none",
            }}
            disabled={isDisabled}
            value={searchText}
            renderInput={(params) => <TextField {...params}
              onKeyDown={(e) => {                         // ✅ Trigger search on Enter
                if (e.key === "Enter") {
                  e.preventDefault();                  // Prevent form submission
                  searchVideo(searchText);             // Trigger search function
                }
              }} label="Search" fullWidth />}

          />
          <button
            disabled={isDisabled}
            onClick={() => searchVideo()}
            className="border-l h-full bg-[#222222] border-[#303030] px-5 flex items-center justify-center hover:bg-[#303030]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              height="24"
              viewBox="0 0 24 24"
              width="24"
              className="text-white"
            >
              <path
                clipRule="evenodd"
                d="M16.296 16.996a8 8 0 11.707-.708l3.909 3.91-.707.707-3.909-3.909zM18 11a7 7 0 00-14 0 7 7 0 1014 0z"
                fillRule="evenodd"
              ></path>
            </svg>
          </button>
        </div>

        {/* Right Section: Create Button, Notifications, User Avatar */}
        <div className={`${back ? "hidden" : "flex"} items-center`}>
          <button
            disabled={isDisabled}
            className=" xs:hidden p-2 mr-2 justify-self-end flex items-center justify-center hover:bg-[#303030]"
            onClick={() => { setBack(true); }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              height="24"
              viewBox="0 0 24 24"
              width="24"
              className="text-white"
            >
              <path
                clipRule="evenodd"
                d="M16.296 16.996a8 8 0 11.707-.708l3.909 3.91-.707.707-3.909-3.909zM18 11a7 7 0 00-14 0 7 7 0 1014 0z"
                fillRule="evenodd"
              ></path>
            </svg>
          </button>
          <button
            onClick={() => navigate("/update-video")}
            disabled={isDisabled}
            className="text-white flex flex-row w-auto  bg-[#222222] hover:bg-gray-700 p-2 mr-2 xxs:w-[90px] h-[40px] border border-s-2  rounded-3xl border-[#303030]"
          >
            {/* Replace CreateIcon with SVG */}
            <span className="pr-1 mt-[1px]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </span>
            <span className="pr-1 xxs:inline hidden">Create</span>
          </button>
          <button
            disabled={isDisabled}
            onClick={toggleNotifications}
            className="text-white hover:bg-gray-700 p-2 rounded-full mr-1"
          >
            {!notificationsPending && <NotificationsNoneIcon />}
            {notificationsPending && <NotificationsIcon />}
          </button>


          <button
            disabled={isDisabled}
            onClick={handleAvatarClick}
            className="text-white hover:bg-gray-700 p-2 rounded-full"
          >
            {channelInfo?.profilePhoto ? <img className='rounded-full w-10 h-10' src={channelInfo?.profilePhoto}></img> : <div className="w-10 h-10 bg-gray-500 rounded-full" />}
          </button>
          {anchorEl !== null && (
            <div ref={dialogRef}
              className="absolute top-[70px] bg-white rounded shadow-lg py-2"
            >
              <button
                disabled={isDisabled}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => { handleAvatarClose(); if (channelInfo) navigate("/profile"); else navigate("/signup") }}
              >
                Profile
              </button>
              <button
                disabled={isDisabled}
                className={`px-4 py-2 text-gray-700 hover:bg-gray-100 ${channelInfo === null ? "hidden" : ""}`}
                onClick={() => { handleAvatarClose(); logout() }}
              >
                Logout
              </button>
            </div>

          )}
          <div className="relative">
            <AnimatePresence mode="wait">

              {notificationsOpen && ( // Ensuring notifications are conditionally rendered
                <motion.div
                  initial={{ scale: 0.0, opacity: 0, y: -200, x: 100 }}
                  animate={{ scale: 1, opacity: 1, y: 0, x: 0 }}
                  exit={{ scale: 0.0, opacity: 0, y: -200, x: 100 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="absolute top-9 right-0 w-[350px] xs:w-[400px] h-[400px] overflow-y-scroll"
                >
                  <Notifications toggle={toggleNotifications} />
                </motion.div>
              )}

            </AnimatePresence>

          </div>
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);
