import React, { useState } from "react";
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
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Search as SearchIcon,
  AddCircle as CreateIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { UPDATE_VIDEO_INFO } from "../utils/constants";
import { useAppStore } from "../store";

const Header = ({ isDisabled }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:768px)");

  // Toggle the menu (avatar options)
  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleAvatarClose = () => {
    setAnchorEl(null);
  };

  const { toggelSidebar } = useAppStore();

  return (
    <header className="sticky top-0 bg-[#121212] shadow-none h-[70px] z-10">
      <div className="flex h-full px-4 justify-between items-center">
        {/* Left Section: Hamburger Icon & Logo */}
        <div className="flex items-center">
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
            onClick={() => navigate("/")}
            className="w-[123px] h-[56px] cursor-default text-white font-bold text-2xl"
          >
            <span className="yt-icon-shape flex justify-center items-center">
              <img src="/assets/logo.png" className="w-[93px] h-[20px]" />
            </span>
          </button>
        </div>

        {/* Center Section: Search Bar */}
        <div className="hidden items-center border mr-1 border-s-2 border-[#303030] h-[40px] rounded-3xl w-[600px] max-w-full bg-[#121212] overflow-hidden xs:flex">
          <input
            disabled={isDisabled}
            className="flex-1 min-w-[30px] bg-[#121212] text-white px-4 outline-none placeholder-gray-500"
            placeholder="Search"
          />
          <button
            disabled={isDisabled}
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
        <div className="flex items-center">
          <button
            disabled={isDisabled}
            className=" xs:hidden p-2 mr-2 justify-self-end flex items-center justify-center hover:bg-[#303030]"
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
            className="text-white hover:bg-gray-700 p-2 rounded-full mr-1"
          >
            <NotificationsNoneIcon />
          </button>

          <button
            disabled={isDisabled}
            onClick={handleAvatarClick}
            className="text-white hover:bg-gray-700 p-2 rounded-full"
          >
            <div className="w-8 h-8 bg-gray-500 rounded-full" />
          </button>
          {anchorEl && (
            <div
              className="absolute top-[70px] bg-white rounded shadow-lg py-2"
              onClick={handleAvatarClose}
            >
              <button
                disabled={isDisabled}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Profile
              </button>
              <button
                disabled={isDisabled}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);
