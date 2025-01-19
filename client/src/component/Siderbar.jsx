import { Box, Button, ClickAwayListener, Drawer } from "@mui/material";
import { blue } from "@mui/material/colors";
import React, { useEffect, useRef, useState } from "react";
import { useAppStore } from "../store";

// const Sidebar = ({ isHome }) => {
import { useNavigate } from "react-router-dom";

const Sidebar = ({ isVideoPlayer }) => {
  //                                 <<-- open and func are temp, will be removed by redux

  const { isSidebarOpen, setIsSidebarOpen } = useAppStore()



  // useState *******************************************************************************
  const [drawerVariant, setDrawerVariant] = useState("persistent");
  // const [isDrawerOpen, setIsDrawerOpen] = useState(isSidebarOpen);

  // constants *******************************************************************************
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  // useEffects ********************************************************************************

  //                  <<-- Always render the Sidebar to avoid the flash effect seeming a component mount time taken
  // useEffect(() => {
  //   setIsSidebarOpen();
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
  }, []);

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

  return (
    <Drawer
      variant={drawerVariant}
      // open={isDrawerOpen}
      onClose={() => {
        setIsSidebarOpen()
      }
        // func(false);
      } // Only relevant for `temporary`
      sx={{
        display: isSidebarOpen ? "block" : "none",
        width: "250px",
        height: "calc(100vh - 70px)",
        top: "70px",
        "& .MuiDrawer-paper": {
          width: "250px",
          // bgcolor: "blue",
          bgcolor: "transparent",
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
        <p>Sidebar Content</p> {/*       <<-- start your sidebar from her  */}
        <Button
          onClick={() => {
            navigate("/");
            if (drawerVariant === "temporary") {
              setIsSidebarOpen()
            }
          }}
        >
          home
        </Button>
        <Button
          onClick={() => {
            navigate("/subs");
            if (drawerVariant === "temporary") {
              setIsSidebarOpen()
            }
          }}
        >
          subs
        </Button>
        <Button
          onClick={() => {
            setIsSidebarOpen()
          }
          }
        >
          close
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
