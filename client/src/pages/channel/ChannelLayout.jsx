import { Box, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAppStore } from "../../store";
import {
  AttachMoneyOutlined,
  NotificationAddOutlined,
} from "@mui/icons-material";
import { isCancel } from "axios";
const ChannelLayout = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(-10);
  const [hoveredTab, setHoveredTab] = useState(activeTab);
  const [sortNo, setSortNo] = useState(0);
  const navigate = useNavigate();

  const buttonsForSorting = ["Latest", "Popular", "Oldest"];
  const sortingFields = ["createdAt_desc", "views_desc", "createdAt_acs"];

  useEffect(() => {
    if (
      location.pathname.split("/")[location.pathname.split("/").length - 1] ===
      "videos"
    ) {
      console.log("videos");
      setActiveTab(0);
      setHoveredTab(0);
    } else if (
      location.pathname.split("/")[location.pathname.split("/").length - 1] ===
      "playlist"
    ) {
      setActiveTab(1);
      setHoveredTab(1);
    }
  }, [location.pathname]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      {/* total top area  */}
      <Box
        sx={{
          // bgcolor: "blue",
          width: "90%",
          margin: "0 auto",
        }}
      >
        {/* Cover image box only  */}
        <Box
          sx={{
            height: "20vw",
            width: "100%",
            margin: "auto",
            borderRadius: "20px",
            overflow: "hidden",
            display: "flex",
            // border: "2px solid red",
            "@media(min-width: 900px)": {
              height: "14vw",
            },
          }}
        >
          <img
            src="https://plus.unsplash.com/premium_photo-1669829646756-083a328c0abb?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bGFuZHNjYXBlc3xlbnwwfHwwfHx8MA%3D%3D"
            alt="cover image"
            style={{
              width: "100%",
              objectFit: "cover",
            }}
          />
        </Box>

        {/* with all the info of the top when screen is big  */}
        <Box
          sx={{
            height: "28vw",
            // bgcolor: "blue",
            maxHeight: "240px",
            display: "flex",
            alignItems: "center",
            gap: "20px",
            "@media (min-width:950px)": {
              minHeight: "210px",
              height: "19vw",
            },
          }}
        >
          <Box
            sx={{
              // bgcolor: "yellow",
              height: "200px",
              width: "200px",
              borderRadius: "100%",
              display: "flex",
              flexWrap: "wrap",
              color: "black",
              overflow: "hidden",
              justifyContent: "center",
              alignItems: "center",
              "@media (max-width: 760px)": {
                height: "150px",
                width: "150px",
              },
              "@media (max-width: 600px)": {
                height: "100px",
                width: "100px",
              },
              // bgcolor: "yellow",
            }}
          >
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcyI9Cvp53aaP9XeRn-ZKbJDH2QaWC72O26A&s"
              alt="ProfilePhoto"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "fill",
              }}
            />
          </Box>
          <Box
            sx={{
              "@media (max-width: 880px)": {
                flex: "0 0 60%",
              },
              // bgcolor: "yellow",
            }}
          >
            <div>
              <Box
                sx={{
                  fontSize: "40px",
                  fontWeight: "bold",
                  wordBreak: "break-word",
                  "@media (max-width: 680px)": {
                    fontSize: "32px",
                  },
                  "@media (max-width: 600px)": {
                    fontSize: "28px",
                  },
                  "@media (max-width: 480px)": {
                    fontSize: "18px",
                  },
                }}
              >
                Channe Name
              </Box>
              <Box
                sx={{
                  "@media (max-width: 680px)": {
                    fontSize: "14px",
                  },
                  "@media (max-width: 600px)": {
                    fontSize: "12px",
                  },
                  "@media (max-width: 450px)": {
                    fontSize: "10px",
                  },
                }}
              >
                <span>useid </span>
                <span
                  style={{
                    marginLeft: "4px",
                    color: "#767676",
                  }}
                >
                  2.2M subs 5.3k vids
                </span>
              </Box>
            </div>

            <Box
              sx={{
                fontSize: "14px",
                marginTop: "8px",
                color: "#767676",
                "@media (max-width: 875px)": {
                  display: "none",
                },
              }}
            >
              Discription
            </Box>
            <div
              style={{
                display: "flex",
                gap: "10px",
              }}
            >
              <Button
                sx={{
                  mt: "28px",
                  bgcolor: "#272727",

                  color: "white",
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 18px",
                  borderRadius: "40px",
                  ":hover": {
                    bgcolor: "#767676",
                  },
                  "@media (max-width: 875px)": {
                    display: "none",
                  },
                }}
              >
                <AttachMoneyOutlined />
                Support Creator
              </Button>
              <Button
                sx={{
                  mt: "28px",
                  bgcolor: "red",
                  color: "white",
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 18px",
                  borderRadius: "40px",
                  ":hover": {
                    bgcolor: "#b10202",
                  },
                  "@media (max-width: 875px)": {
                    display: "none",
                  },
                }}
              >
                <NotificationAddOutlined />
                Susbscribe
              </Button>
            </div>
          </Box>
        </Box>

        {/* Discription for small screen  */}
        <Box
          sx={{
            "@media (min-width: 875px)": {
              display: "none",
            },
          }}
        >
          <Box>Discription</Box>

          {/* subscription butons for small screen  */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
            }}
          >
            <Button
              sx={{
                mt: "28px",
                bgcolor: "#272727",
                fontSize: "14px",
                color: "white",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                width: "45%",
                // padding: "8px 0",

                borderRadius: "40px",
                ":hover": {
                  bgcolor: "#767676",
                },
              }}
            >
              <AttachMoneyOutlined />
              Support Creator
            </Button>
            <Button
              sx={{
                mt: "28px",
                bgcolor: "red",
                fontSize: "14px",
                color: "white",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                width: "45%",
                // padding: "8px 18px",

                borderRadius: "40px",
                ":hover": {
                  bgcolor: "#b10202",
                },
              }}
            >
              <NotificationAddOutlined />
              Susbscribe
            </Button>
          </div>
        </Box>
      </Box>

      {/* mid bar with video and playlist button  */}
      <Box
        sx={{
          bgcolor: "#121212",
          width: "100%",
          display: "flex",
          gap: "25px",
          position: "sticky",
          top: "70px",
          fontSize: "18px",
          padding: "0 10%",
          borderBottom: "1px solid #767676",
          zIndex: "10",
        }}
      >
        <Box
          onMouseEnter={() => {
            setHoveredTab(0);
          }}
          onMouseLeave={() => {
            setHoveredTab(activeTab);
          }}
          sx={{
            cursor: "pointer",
            padding: "12px 0",
            boxSizing: "border-box",
            height: "50px",
            position: "relative",

            color: hoveredTab == 0 ? "white" : "#b3b3b3",
            transition: "color 0.3s",
          }}
          onClick={() => navigate("/channel/67859dd754c800dc4239e30f/videos")}
        >
          Videos
        </Box>
        <Box
          onMouseEnter={() => {
            setHoveredTab(1);
          }}
          onMouseLeave={() => {
            setHoveredTab(activeTab);
          }}
          sx={{
            cursor: "pointer",
            padding: "12px 0",
            boxSizing: "border-box",
            height: "50px",
            position: "relative",
            color: hoveredTab == 1 ? "white" : "#b3b3b3",
          }}
          onClick={() => navigate("/channel/67859dd754c800dc4239e30f/playlist")}
        >
          Playlist
        </Box>
        <Box
          sx={{
            bgcolor: "white",
            width: "57px",
            height: "2px",
            position: "absolute",
            bottom: "0px",
            transition: "all 0.5s ",
            left: `calc(10% + ${hoveredTab * (57 + 25)}px)`,
          }}
        />
      </Box>

      {/* last content  */}
      <Box
        sx={{
          padding: "0 8%",
          mt: "12px",
          display: "flex",
          gap: "15px",
        }}
      >
        {buttonsForSorting.map((title, index) => (
          <ButtonForSorting
            isActive={index === sortNo}
            sortNo={index}
            title={title}
            setSortNo={setSortNo}
          />
        ))}
      </Box>
      <Box
        sx={
          {
            // width: "100%",
            // padding: "0 10%",
            // bgcolor: "red",
          }
        }
      >
        <Outlet context={{ sort: sortingFields[sortNo] }} />
      </Box>
    </Box>
  );
};

export default ChannelLayout;

const ButtonForSorting = ({ isActive = false, setSortNo, title, sortNo }) => {
  return (
    <Button
      onClick={() => setSortNo(sortNo)}
      sx={{
        bgcolor: isActive ? "white" : "#272727",
        color: isActive ? "black" : "white",
        fontSize: "12px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "7px 12px",
        mb: "4px",
        fontWeight: "bold",

        borderRadius: "10px",
        ":hover": {
          bgcolor: !isActive && "#767676",
        },
      }}
    >
      {title}
    </Button>
  );
};
