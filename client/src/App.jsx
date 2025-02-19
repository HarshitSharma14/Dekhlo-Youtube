import React, { lazy, Suspense, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import axios from "axios";
import HomeLayoutLoadingPage from "./component/LoadingLayouts/HomeLayoutLoadingPage.jsx";
import ProtectedRoute from "./pages/auth/ProtectedRoute.jsx";
import { useAppStore } from "./store/index.js";
import { GET_CHANNEL_DETAILS } from "./utils/constants.js";

// Routes imports ****************************************
const HomeLayout = lazy(() => import("./pages/home/HomeLayout.jsx"));
const Signup = lazy(() => import("./pages/auth/Signup.jsx"));
const ProfileSetup = lazy(() => import("./pages/auth/ProfileSetup.jsx"));
const HomeContent = lazy(() => import("./pages/home/HomeContent.jsx"));
const ChannelLayout = lazy(() => import("./pages/channel/ChannelLayout.jsx"));
const ChannelVideos = lazy(() => import("./pages/channel/ChannelVideos.jsx"));
const ChannelsSubscribed = lazy(() =>
  import("./pages/subscribtion/ChannelsSubscribed.jsx")
);
const VideoPlayer = lazy(() => import("./pages/videoPlayer/VideoPlayer.jsx"));
const UpdateVideo = lazy(() => import("./pages/home/UpdateVideo.jsx"));
const ChannelPlaylist = lazy(() =>
  import("./pages/channel/ChannelPlaylist.jsx")
);

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<HomeLayoutLoadingPage />}>
        <HomeLayout />
      </Suspense>
    ),

    children: [
      {
        path: "/",
        element: <HomeContent />,
      },

      {
        path: "/subs",
        element: (
          <ProtectedRoute>
            <ChannelsSubscribed />
          </ProtectedRoute>
        ),
      },

      {
        path: "/video-player/:videoId",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <VideoPlayer />
          </Suspense>
        ),
      },
      {
        path: "/channel/:channelId/",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ChannelLayout />
          </Suspense>
        ),
        children: [
          {
            path: "",
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <ChannelVideos />
              </Suspense>
            ),
          },
          {
            path: "playlist",
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <ChannelPlaylist />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  {
    path: "/signup",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <Signup />
      </Suspense>
    ),
  },
  {
    path: "/profile-setup",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<div>Loading...</div>}>
          <ProfileSetup />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/update-video",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<div>Loading...</div>}>
          <UpdateVideo />{" "}
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/video-player/:videoId",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <VideoPlayer />{" "}
      </Suspense>
    ),
  },
  {
    path: "/*",
    element: <Navigate to="/" replace />,
  },
]);
const App = () => {
  const { setChannelInfo } = useAppStore();
  const getChannelInfo = async () => {
    try {
      const { data } = await axios.get(GET_CHANNEL_DETAILS, {
        withCredentials: true,
      });
      console.log("in app data", data.channel);
      setChannelInfo(data.channel);
    } catch (err) {
      setChannelInfo(null);
      console.log("not logged in", err);
    }
  };
  useEffect(() => {
    getChannelInfo();
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          // Custom styling for dark theme
          style: {
            background: "#333", // Dark background
            color: "#fff", // White text
            borderRadius: "8px", // Rounded corners
            padding: "10px 15px", // Padding
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Shadow effect
          },
          success: {
            style: {
              background: "#4caf50", // Green background for success
            },
          },
          error: {
            style: {
              background: "#f44336", // Red background for errors
            },
          },
          loading: {
            style: {
              background: "#ffa500", // Orange background for loading
            },
          },
        }}
      />
    </>
  );
};

export default App;
