import React, { lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoadingPage from "./component/LoadingPage.jsx";
import { LocalDiningSharp } from "@mui/icons-material";
import UpdateVideo from "./pages/home/UpdateVideo.jsx";
import VideoPlayer from "./pages/home/VideoPlayer.jsx";

// Routes imports ****************************************
const Home = lazy(() => import("./pages/home/Home.jsx"));
const Signup = lazy(() => import("./pages/auth/Signup.jsx"));
const ProfileSetup = lazy(() => import("./pages/auth/ProfileSetup.jsx"));
const HomeContent = lazy(() => import("./pages/home/HomeContent.jsx"));
// const UpdateVideo = lazy(() => import("./pages/home/UpdateVideo.jsx"));

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<LoadingPage />}>
        <Home />
      </Suspense>
    ),

    children: [
      {
        path: "/",
        element: <HomeContent />,
      },

      {
        path: "/subs",
        element: <ProfileSetup />,
      },
      {
        path: "/video-player/:videoId",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <VideoPlayer />{" "}
          </Suspense>
        ),
      }
    ],
  },
  {
    path: "/loading",
    element: <LoadingPage />,
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
      <Suspense fallback={<div>Loading...</div>}>
        <ProfileSetup />
      </Suspense>
    ),
  },
  {
    path: "/update-video",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <UpdateVideo />{" "}
      </Suspense>
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
    element: <div>Kidhar aa gaya chutiye page route hi nhi hai</div>,
  },
]);
const App = () => {
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
