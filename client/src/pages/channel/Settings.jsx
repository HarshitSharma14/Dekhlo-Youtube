import { Switch, Button } from "@mui/material";
import { Link } from "react-router-dom";
import api from "../../utils/api.js";
import { DELETE_CHANNEL } from "../../utils/constants";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store";
import toast from "react-hot-toast";
import { useState } from "react";
import DeleteDialogBox from "../../component/DeleteDialogBox.jsx";

const Settings = () => {
  const { setIsLoggedIn, setChannelInfo } = useAppStore();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleDeleteChannel = async () => {
    try {
      await api.delete(DELETE_CHANNEL);
      toast.success("Channel deleted successfully");
      setTimeout(() => {
        setIsLoggedIn(false);
        setChannelInfo(null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }, 100);
      navigate("/", { replace: true });
    } catch (error) {
      toast.error("Failed to delete channel");
    }
  };

  const handleUpdateChannel = () => {
    navigate("/update-channel");
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center  text-white">
      <div className="flex w-full pl-5 flex-col md:w-[80%] min-h-screen">
        <div className="pt-5 text-5xl font-sans font-medium">Settings</div>
        <div className="mt-5 pl-5  flex-row flex">
          <div>
            <Switch defaultChecked />
          </div>
          <div className="flex-col flex pl-3">
            <div className="text-lg">Watch history</div>
            <div className="text-sm text-gray-500">
              Save videos I watch to my watch history.
            </div>
          </div>
        </div>
        <div className="pt-5 pl-2 text-2xl font-sans font-normal">
          Notifications
        </div>
        <div className="mt-5 pl-5  flex-row flex">
          <div>
            <Switch defaultChecked />
          </div>
          <div className="flex-col flex pl-3">
            <div className="text-lg">Subscriptions</div>
            <div className="text-sm text-gray-500">
              Notify me about new videos from my subscriptions.
            </div>
          </div>
        </div>
        <div className="mt-5 pl-5  flex-row flex">
          <div>
            <Switch defaultChecked />
          </div>
          <div className="flex-col flex pl-3">
            <div className="text-lg">New subscribers</div>
            <div className="text-sm text-gray-500">
              Notify me about my new subscribers.
            </div>
          </div>
        </div>
        <div className="mt-5 pl-5  flex-row flex">
          <div>
            <Switch defaultChecked />
          </div>
          <div className="flex-col flex pl-3">
            <div className="text-lg">Video Liked</div>
            <div className="text-sm text-gray-500">
              Notify me when someone likes my video.
            </div>
          </div>
        </div>

        <div className="mt-5 pl-5  flex-row flex">
          <div>
            <Switch defaultChecked />
          </div>
          <div className="flex-col flex pl-3">
            <div className="text-lg">Comment Liked</div>
            <div className="text-sm text-gray-500">
              Notify me when someone likes my comment.
            </div>
          </div>
        </div>

        {/* Channel Management Section */}
        <div className="mt-8 mb-6 mx-5 p-6 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 border border-gray-600/30 shadow-xl rounded-xl backdrop-blur-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <svg
                className="w-4 h-4 text-white"
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
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">
                Channel Management
              </h3>
              <p className="text-sm text-gray-400">
                Update your channel information and settings
              </p>
            </div>
          </div>

          <Link to="/profile-setup" className="block">
            <button
              onClick={handleUpdateChannel}
              className="group relative w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium py-3 px-5 rounded-lg transition-all duration-300 border border-blue-500/30 shadow-md hover:shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.99] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative flex items-center justify-center space-x-2">
                <svg
                  className="w-4 h-4 text-blue-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <span>Update Channel Info</span>
              </div>
            </button>
          </Link>
        </div>

        {/* Danger Zone - Delete Channel Only */}
        <div className="mt-6 mb-10 mx-5 p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-red-500/30 shadow-2xl rounded-2xl backdrop-blur-sm relative overflow-hidden">
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-red-600/3 to-red-500/5 rounded-2xl"></div>

          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-500 rounded-t-2xl"></div>

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
                  Danger Zone
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Irreversible action - proceed with extreme caution
                </p>
              </div>
            </div>

            {/* Warning message */}
            <div className="mb-8 p-4 bg-red-900/20 border border-red-500/30 rounded-xl backdrop-blur-sm">
              <div className="flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <div>
                  <p className="text-sm text-red-200 font-medium">
                    ⚠️ Warning: Channel deletion cannot be undone
                  </p>
                  <p className="text-xs text-red-300/80 mt-1">
                    Deleting your channel will permanently remove all videos,
                    playlists, and data. Make sure you have backups of any
                    important content before proceeding.
                  </p>
                </div>
              </div>
            </div>

            {/* Delete Channel Button */}
            <div className="flex justify-center">
              <button
                onClick={() => setOpen(true)}
                className="group relative w-full max-w-md bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 border border-red-500/30 shadow-lg hover:shadow-red-500/25 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
              >
                {/* Button background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative flex items-center justify-center space-x-2">
                  <svg
                    className="w-5 h-5 text-red-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <span>Delete Channel</span>
                </div>
              </button>
            </div>

            {/* Bottom accent */}
            <div className="mt-6 pt-4 border-t border-gray-700/50">
              <p className="text-xs text-gray-500 text-center">
                🔒 This action is logged and cannot be reversed
              </p>
            </div>
          </div>
        </div>
      </div>
      <DeleteDialogBox
        open={open}
        setOpen={setOpen}
        deleteHandler={handleDeleteChannel}
        deleteText="Are you sure to delete your channel"
      />
    </div>
  );
};

export default Settings;
