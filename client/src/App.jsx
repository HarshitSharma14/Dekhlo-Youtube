import React, { lazy, Suspense, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import axios from "axios";
import HomeLayoutLoadingPage from "./component/loadingLayouts/HomeLayoutLoadingPage.jsx";
import ProtectedRoute from "./pages/auth/ProtectedRoute.jsx";
import { useAppStore } from "./store/index.js";
import { GET_CHANNEL_DETAILS } from "./utils/constants.js";
// import PlaylistContent from "./pages/channel/PlaylistContent.jsx";

// Routes imports ****************************************
const HomeLayout = lazy(() => import("./pages/home/HomeLayout.jsx"));
const Signup = lazy(() => import("./pages/auth/Signup.jsx"));
const ProfileSetup = lazy(() => import("./pages/auth/ProfileSetup.jsx"));
const WatchHistory = lazy(() => import("./pages/channel/WatchHistory.jsx"));
const PlaylistContent = lazy(() =>
  import("./pages/channel/PlaylistContent.jsx")
);
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

        element: (
          <Suspense fallback={<>loading page contents ...</>}>
            <HomeContent />
          </Suspense>
        ),
      },

      {
        path: "/subs",
        element: (
          <ProtectedRoute>
            <Suspense
              fallback={<div>Getting the Subscriptions Page ready...</div>}
            >
              <ChannelsSubscribed />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/history",
        element: (
          <ProtectedRoute>
            <Suspense
              fallback={<div>Getting the WatchHistory Page ready...</div>}
            >
              <WatchHistory />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/playlist",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <PlaylistContent />
          </Suspense>
        ),
      },

      {
        path: "/video-player/:videoId",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <Suspense
              fallback={<div>Getting the VideoPlayer Page ready...</div>}
            >
              <VideoPlayer key={window.location.href} />
            </Suspense>
          </Suspense>
        ),
      },
      {
        path: "/channel/:channelId/",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <Suspense fallback={<div>Getting the Profile Page ready...</div>}>
              <ChannelLayout />
            </Suspense>
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
  const { setChannelInfo, isLoggedIn, setIsLoggedIn } = useAppStore();
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
  }, [isLoggedIn]);

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
