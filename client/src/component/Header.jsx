import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { Autocomplete, Avatar, TextField, useMediaQuery } from "@mui/material";
import api from "../utils/api.js";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppStore } from "../store";
import {
  AUTOCOMPLETE_ROUTE,
  CHANGE_ISREAD,
  GET_NOTIFICATIONS,
  LOGOUT_ROUTE,
} from "../utils/constants";
import Notifications from "./Notifications";
import YoutubeIconSection from "./YoutubeIconSection";

const Header = ({ isDisabled }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const s = searchParams.get("s");
  const {
    channelInfo,
    setChannelInfo,
    setIsLoggedIn,
    setNotifications,
    clearNotifications,
    notifications,
    notificationsPending,
    setNotificationsPending,
  } = useAppStore();
  const [back, setBack] = useState(false);
  const [searchText, setSearchText] = useState(s || "");
  const [suggestions, setSuggestions] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  // Toggle the menu (avatar options)
  const dialogRef = useRef(null);
  const handleAvatarClick = (event) => {
    if (anchorEl === null) {
      setAnchorEl(event.currentTarget);
    } else {
      setAnchorEl(null);
    }
  };
  const handleAvatarClose = () => {
    setAnchorEl(null);
  };
  const handleClickOutside = (event) => {
    // Only handle clicks if they're not on the dialog itself
    if (dialogRef.current && !dialogRef.current.contains(event.target)) {
      event.preventDefault();
      event.stopPropagation();
      setAnchorEl(null);
    }
  };
  useEffect(() => {
    if (anchorEl) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [anchorEl]);

  const toggleNotifications = async () => {
    if (notificationsOpen) {
      setNotificationsOpen(false);
    } else {
      setNotificationsOpen(true);
      try {
        await api.get(`${CHANGE_ISREAD}?t=${notifications[0].createdAt}`);
        setNotificationsPending(false);
      } catch (e) {
        // Handle error
      }
    }
  };

  const searchVideo = async (value) => {
    navigate(`/search?s=${value}`);

    return;
  };

  const fetchAutocomplete = async (text) => {
    try {
      const response = await api.get(AUTOCOMPLETE_ROUTE, {
        params: { searchText: text },
      });
      setSuggestions(response.data.results);
    } catch (error) {
      // Handle error
    }
  };

  const handleChange = (value) => {
    setSearchText(value);

    if (value.length > 1) {
      fetchAutocomplete(value);
    } else {
      setSuggestions([]);
    }
  };

  useEffect(() => {
    const fetchNoti = async () => {
      try {
        const response = await api.get(GET_NOTIFICATIONS);

        if (response.data[response.data.length - 1].isRead) {
          setNotificationsPending(false);
        } else {
          setNotificationsPending(true);
        }
        if (response.data) {
          clearNotifications();
          response.data.forEach((notification) => {
            setNotifications(notification); // Adds each notification one by one
          });
        }
      } catch (e) {
        // Handle error
      }
    };
    if (channelInfo) fetchNoti();
  }, []);

  const handleError = (e) => {
    // Handle error
  };

  const handleLogout = async () => {
    const toastId = toast.loading("Logging out...");
    try {
      const response = await api.get(LOGOUT_ROUTE);
      if (response.status === 200) {
        toast.success("Logout successful", { id: toastId });
        setIsLoggedIn(false);
        setChannelInfo(null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/");
      }
    } catch (e) {
      toast.error("Logout failed", { id: toastId });
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 650) {
        setBack(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { toggelSidebar } = useAppStore();

  return (
    <header className="sticky top-0 bg-[#121212] shadow-none h-[70px] z-10">
      <div className="flex h-full pr-2 justify-between items-center">
        {/* Left Section: Hamburger Icon & Logo */}
        <YoutubeIconSection />

        {/* Center Section: Search Bar */}
        <div
          className={`${
            back ? "flex ml-[60px] mr-[20px]" : "hidden"
          } items-center border mr-1 border-s-2 border-[#303030] h-[40px] rounded-3xl w-[600px] max-w-full bg-[#121212] overflow-hidden xs:flex`}
        >
          <Autocomplete
            freeSolo
            options={suggestions}
            onChange={(e, value) => {
              // For selection
              if (value) {
                setSearchText(() => value);
                searchVideo(value);
                // Trigger search only on selection
              }
            }}
            className="flex-1 min-w-[30px] bg-[#121212] text-white px-4 outline-none placeholder-gray-500"
            onInputChange={(e, value) => {
              handleChange(value);
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                border: "none", // ✅ Remove border
                "& fieldset": { border: "none" }, // ✅ Remove default fieldset border
                backgroundColor: "transparent", // ✅ Transparent background
              },
              "& .MuiAutocomplete-option:hover": {
                // 🎯 Hover Effect
                backgroundColor: "rgba(0, 123, 255, 0.1)",
                color: "blue",
                fontWeight: "bold",
              },
              border: "none",
            }}
            disabled={isDisabled}
            value={searchText}
            renderInput={(params) => (
              <TextField
                {...params}
                onKeyDown={(e) => {
                  // ✅ Trigger search on Enter
                  if (e.key === "Enter") {
                    e.preventDefault(); // Prevent form submission
                    searchVideo(searchText); // Trigger search function
                  }
                }}
                label="Search"
                fullWidth
              />
            )}
          />
          <button
            disabled={isDisabled}
            onClick={() => searchVideo(searchText)}
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
            onClick={() => {
              setBack(true);
            }}
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
            <Avatar
              sx={{ width: "2.5rem", height: "2.5rem" }}
              className="rounded-full"
              src={channelInfo?.profilePhoto}
              alt="profile"
            />
          </button>
          <AnimatePresence>
            {anchorEl !== null && (
              <>
                {/* Backdrop to prevent clicks behind dialog */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40"
                  onClick={handleAvatarClose}
                />
                <motion.div
                  ref={dialogRef}
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute top-[70px] right-0 bg-[#1f1f1f] rounded-xl  shadow-2xl py-4 w-80 max-w-[calc(100vw-2rem)] border border-gray-700 z-50 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Profile Header */}
                  <div className="px-6 pb-4 border-b border-gray-700">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Avatar
                          sx={{ width: "4rem", height: "4rem" }}
                          className="rounded-full object-cover border-2 border-gray-600"
                          src={channelInfo?.profilePhoto}
                          alt="profile"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white truncate">
                          {channelInfo?.channelName || "Channel Name"}
                        </h3>
                        <p className="text-sm text-gray-400 truncate">
                          {channelInfo?.email || "email@example.com"}
                        </p>
                        <div className="flex items-center mt-1">
                          <svg
                            className="w-4 h-4 mr-1 text-gray-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-300">
                            {channelInfo?.followers || 0} followers
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-6 pt-4 space-y-2">
                    <button
                      disabled={isDisabled}
                      className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-200 bg-gray-800 hover:bg-gray-700 hover:shadow-sm rounded-lg transition-all duration-200 border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => {
                        handleAvatarClose();
                        if (channelInfo)
                          navigate(`/channel/${channelInfo._id}`);
                      }}
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Profile
                    </button>

                    {channelInfo && (
                      <button
                        disabled={isDisabled}
                        className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-red-400 bg-red-900/20 hover:bg-red-900/30 hover:shadow-sm rounded-lg transition-all duration-200 border border-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => {
                          handleAvatarClose();
                          handleLogout();
                        }}
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Logout
                      </button>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-6 pt-4 border-t border-gray-700">
                    <p className="text-xs text-gray-500 text-center">
                      YouTube Clone App
                    </p>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
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
