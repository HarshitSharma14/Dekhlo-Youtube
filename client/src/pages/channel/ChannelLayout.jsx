import React, { useEffect, useState } from "react";
import {
  AttachMoneyOutlined,
  Close as CloseIcon,
  KeyboardArrowDownOutlined,
  NotificationAddOutlined,
  Notifications,
  NotificationsOff,
  People,
  PersonRemove,
  VideoLibrary,
  Visibility,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Modal,
  Popover,
  Switch,
  Typography,
} from "@mui/material";
import axios from "axios";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  GET_CHANNEL_DETAILS,
  SUBSCRIBE_CHANNEL,
  TOGGLE_BELL,
  UNSUBSCRIBE_CHANNEL,
} from "../../utils/constants";
import toast from "react-hot-toast";

const ChannelLayout = () => {
  // useState **********************************************************************************
  const [activeTab, setActiveTab] = useState(-10);
  const [hoveredTab, setHoveredTab] = useState(activeTab);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [channel, setChannel] = useState(null);
  const [sortNo, setSortNo] = useState(0);
  const [isBellEnabled, setIsBellEnabled] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);

  // constant **********************************************************************************
  const navigate = useNavigate();
  const buttonsForSorting = ["Latest", "Popular", "Oldest"];
  const sortingFields = ["createdAt_desc", "views_desc", "createdAt_acs"];
  const location = useLocation();
  const params = useParams();
  const { channelId } = params;
  const smallScreenConfig = {
    justifyContent: "center",
    width: "45%",
    "@media (max-width: 500px)": {
      fontSize: "12px",
      mt: "7px",
    },
    "@media (max-width: 410px)": {
      width: "auto",
    },
  };
  const bigScreenConfig = {
    justifyContent: "space-around",

    "@media (max-width: 875px)": {
      display: "none",
    },
  };

  // functions **********************************************************************************
  const getChannelInfo = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${GET_CHANNEL_DETAILS}/${channelId}`, {
        withCredentials: true,
      });
      console.log(data.channel);
      setChannel(data.channel);
      setIsSubscribed(data.channel.isSubscribed);
    } catch (err) {
      console.log("err", err.response);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (e) => {
    if (isSubscribed) {
      setAnchorEl(e.currentTarget);
      return;
    }
    setIsDisabled(true);
    try {
      await axios.post(
        SUBSCRIBE_CHANNEL,
        { creatorId: channelId },
        {
          withCredentials: true,
        }
      );
      setIsSubscribed(true);
    } catch (err) {
      setIsSubscribed(false);
      console.log("not subs ", err);
      toast.error(err?.response?.data?.message || "Something went wrong ");
    } finally {
      setIsDisabled(false);
    }
  };

  const handleUnsubscribe = () => {
    setIsSubscribed(false);
    setAnchorEl(null); // Close the dropdown
  };

  const toggleBell = () => {
    setIsBellEnabled(!isBellEnabled);
  };

  // useEffect **********************************************************************************
  useEffect(() => {
    if (
      location.pathname.split("/")[location.pathname.split("/").length - 1] ===
      `${channelId}`
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

  useEffect(() => {
    getChannelInfo();
  }, [channelId]);

  return (
    <>
      {isLoading && <Box>Channel details fetching</Box>}
      {!isLoading && channel && (
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
            {channel?.coverImage && (
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
                  src={channel.coverImage}
                  alt="cover image"
                  style={{
                    width: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>
            )}

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
                  src={channel?.profilePhoto}
                  alt="ProfilePhoto"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
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
                    {channel?.channelName}
                  </Box>
                  <Box
                    sx={{
                      "@media (max-width: 760px)": {
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
                    <span style={{}}>@{channel?.email} </span>
                    <span
                      style={{
                        marginLeft: "4px",
                        color: "#767676",
                      }}
                    >
                      • {channel?.followers} subscribers • {channel?.videos}{" "}
                      videos
                    </span>
                  </Box>
                </div>
                <DiscriptionDialogBox isBig={true} channel={channel} />
                <Box
                  sx={{
                    display: channel.isOwner ? "none" : "flex",
                    gap: "10px",
                  }}
                >
                  <ButtonForCreatorSupport
                    button={2}
                    config={bigScreenConfig}
                    channelId={channelId}
                  />
                  <ButtonForCreatorSupport
                    button={1}
                    isSubscribedInitially={isSubscribed}
                    isBellInitially={channel.isBell}
                    config={bigScreenConfig}
                    channelId={channelId}
                  />
                </Box>
              </Box>
            </Box>

            {/* Discription and button for subs and creator support  for small screen  */}
            <Box
              sx={{
                display: channel.isOwner && "none",
                "@media (min-width: 875px)": {
                  display: "none",
                },
              }}
            >
              <DiscriptionDialogBox channel={channel} />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                }}
              >
                <ButtonForCreatorSupport
                  button={2}
                  config={smallScreenConfig}
                  channelId={channelId}
                />
                <ButtonForCreatorSupport
                  button={1}
                  isSubscribedInitially={isSubscribed}
                  isBellInitially={channel.isBell}
                  config={smallScreenConfig}
                  channelId={channelId}
                />
              </div>
            </Box>
          </Box>

          {/* ****************************************************************************************************************************************************** */}
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

                color: activeTab == 0 ? "white" : "#b3b3b3",
                transition: "color 0.3s",
              }}
              onClick={() => navigate(`/channel/${channelId}`)}
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
                color: activeTab == 1 ? "white" : "#b3b3b3",
              }}
              onClick={() => navigate(`/channel/${channelId}/playlist`)}
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
          {activeTab === 0 && (
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
          )}
          <Box>
            <Outlet
              context={{
                sort: sortingFields[sortNo],
                isOwner: channel.isOwner,
              }}
            />
          </Box>
        </Box>
      )}
      {!isLoading && !channel && <div>Channel does not exist</div>}
    </>
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

const DiscriptionDialogBox = ({ isBig = false, channel }) => {
  const [isDiscription, setIsDiscription] = useState(false);

  return (
    <Box
      sx={{
        padding: isBig ? "0" : "0 20px",
        marginTop: isBig && "8px",
        maxHeight: "24px",
        alignItems: "center",
        width: "auto",
        color: "#767676",
        // bgcolor: "yellow",
        wordBreak: "break-word",
        overflow: "hidden",
        display: "inline-block",
        position: "relative",
        "@media (max-width: 875px)": {
          display: isBig && "none",
        },
      }}
    >
      {channel?.bio}

      <p
        onClick={() => setIsDiscription(true)}
        style={{
          position: "absolute",
          right: "0px",
          top: "0",
          // borderRadius: "40px",
          backgroundColor: "#121212",
          zIndex: "2",
          boxShadow: "-8px 0 20px 10px #121212",
          color: "white",
          cursor: "pointer",
        }}
      >
        ...more
      </p>
      <Modal
        open={isDiscription}
        onClose={() => setIsDiscription(false)}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: "400px" },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* Close Button */}
          <IconButton
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "grey.600",
            }}
            onClick={() => setIsDiscription(false)}
          >
            <CloseIcon />
          </IconButton>

          {/* Modal Header */}
          <Typography id="modal-title" variant="h5" fontWeight="bold">
            Channel Details
          </Typography>

          <Divider />

          {/* Bio Section */}
          <Typography
            id="modal-description"
            variant="body1"
            color="text.secondary"
          >
            {channel?.bio || "No bio available."}
          </Typography>

          {/* About Section */}
          <Typography id="modal-title" variant="h6" fontWeight="bold" mt={2}>
            About Channel
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mt: 1,
            }}
          >
            <People fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {channel?.followers || "0"} subscribers
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <VideoLibrary fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {channel?.videos || "0"} videos
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Visibility fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {channel?.views || "0"} total views
            </Typography>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

const ButtonForCreatorSupport = ({
  button = 1,
  isSubscribedInitially = false,
  isBellInitially = false,
  config = {
    justifyContent: "space-around",

    "@media (max-width: 714px)": {
      display: "none",
    },
  },

  channelId,
}) => {
  const [isSubscribed, setIsSubscribed] = useState(isSubscribedInitially);
  const [isBell, setIsBell] = useState(isBellInitially);
  const [disabled, setDisabled] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // functions ***************************************************************************
  const handleSubscribe = async () => {
    setDisabled(true);
    try {
      await axios.post(
        SUBSCRIBE_CHANNEL,
        { creatorId: channelId },
        {
          withCredentials: true,
        }
      );
      setIsSubscribed(true);
    } catch (err) {
      setIsSubscribed(false);
      console.log("not subs ", err);
      toast.error(err?.response?.data?.message || "Something went wrong ");
    } finally {
      setDisabled(false);
    }
  };
  const handleUnsubscribe = async () => {
    setDisabled(true);
    try {
      await axios.delete(UNSUBSCRIBE_CHANNEL, {
        data: { creatorId: channelId },

        withCredentials: true,
      });
      setIsSubscribed(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setAnchorEl(null); // Close popover after action
      setDisabled(false);
    }
  };

  const handleToggleBell = async () => {
    setDisabled(true);
    try {
      await axios.patch(
        TOGGLE_BELL,
        { creatorId: channelId },
        {
          withCredentials: true,
        }
      );
      const bellTemp = isBell;
      setIsBell(!bellTemp);
    } catch (err) {
      console.log("bell icon ", err);
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setAnchorEl(null); // Close popover after action
      setDisabled(false);
    }
  };

  const handleClick = (e) => {
    if (button === 2) {
      console.log("clicked on support creato");
      return;
    } else if (!isSubscribed) {
      handleSubscribe();
    } else {
      setAnchorEl(e.currentTarget);
      return;
    }
  };

  return (
    <>
      <Button
        sx={{
          mt: "28px",
          bgcolor: isSubscribed || button == 2 ? "#272727" : "red",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "8px 18px",
          borderRadius: "40px",
          ":hover": {
            bgcolor: isSubscribed || button == 2 ? "#767676" : "#b10202",
          },
          ...config,
        }}
        onClick={handleClick}
        disabled={disabled}
      >
        {button === 1 && (
          <>
            {isSubscribed &&
              (isBell ? <Notifications /> : <NotificationsOff />)}
            {isSubscribed ? "Subscribed" : "Susbscribe"}
            {/* {isSubscribed && <KeyboardArrowDownOutlined />} */}
          </>
        )}
        {button === 2 && (
          <>
            <AttachMoneyOutlined /> Support Creator
          </>
        )}
      </Button>

      {button === 1 && (
        <Popover
          open={Boolean(anchorEl)}
          sx={{
            width: "100%",
          }}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
        >
          <Box
            sx={{
              bgcolor: "#1e1e1e",
              color: "white",
              width: 200,
              borderRadius: "8px",
            }}
          >
            {/* Unsubscribe Button */}
            <Button
              fullWidth
              sx={{
                padding: "10px",
                bgcolor: "#272727",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: "10px",
                textTransform: "none",
                ":hover": {
                  bgcolor: "#3a3a3a",
                },
              }}
              onClick={handleUnsubscribe}
              disabled={disabled}
            >
              <PersonRemove />
              Unsubscribe
            </Button>

            {/* Turn Off Bell Notifications Button */}
            <Button
              fullWidth
              sx={{
                padding: "10px",

                bgcolor: "#272727",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: "10px",
                textTransform: "none",
                ":hover": {
                  bgcolor: "#3a3a3a",
                },
              }}
              onClick={handleToggleBell}
              disabled={disabled}
            >
              {/* <Notifications /> */}
              {isBell ? (
                <>
                  <NotificationsOff />
                  Turn Off Bell{" "}
                </>
              ) : (
                <>
                  <Notifications />
                  Turn on Bell
                </>
              )}
            </Button>
          </Box>
        </Popover>
      )}
    </>
  );
};

export { ButtonForCreatorSupport };
