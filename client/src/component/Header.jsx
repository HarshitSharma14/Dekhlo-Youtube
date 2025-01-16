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
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  AddCircle as CreateIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Header = () => {
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

  // Navigate to home when YouTube logo is clicked
  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <AppBar
      //   position="sticky"
      sx={{
        background: "linear-gradient(to bottom, #0c0c0c, #121212)",
        boxShadow: "none",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Left Section: Hamburger Icon & Logo */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Button
            onClick={handleLogoClick}
            sx={{ color: "white", fontWeight: "bold", fontSize: "24px" }}
          >
            YouTube
          </Button>
        </div>

        {/* Center Section: Search Bar */}
        <div
          style={{
            flex: 1,
            maxWidth: "600px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <SearchIcon sx={{ color: "white", marginRight: 1 }} />
          <InputBase
            placeholder="Search"
            sx={{
              backgroundColor: "#333",
              borderRadius: "20px",
              paddingLeft: "10px",
              color: "white",
              width: "100%",
              maxWidth: isMobile ? "80%" : "100%",
            }}
          />
        </div>

        {/* Right Section: Create Button, Notifications, User Avatar */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <IconButton color="inherit" sx={{ mr: 2 }}>
            <CreateIcon />
          </IconButton>
          <IconButton color="inherit" sx={{ mr: 2 }}>
            <NotificationsIcon />
          </IconButton>
          <IconButton color="inherit" onClick={handleAvatarClick}>
            <Avatar sx={{ bgcolor: "gray" }} alt="User Avatar" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleAvatarClose}
            sx={{ mt: "40px" }}
          >
            <MenuItem onClick={handleAvatarClose}>Profile</MenuItem>
            <MenuItem onClick={handleAvatarClose}>Logout</MenuItem>
          </Menu>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
