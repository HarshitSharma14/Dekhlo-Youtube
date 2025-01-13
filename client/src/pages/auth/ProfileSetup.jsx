import { Visibility, VisibilityOff } from "@mui/icons-material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import {
  Avatar,
  Box,
  Button,
  CssBaseline,
  IconButton,
  InputAdornment,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import axios from "axios";
import React, { useEffect, useState } from "react";
import "./ProfileSetup.css";
import toast from "react-hot-toast";
import { Form } from "react-router-dom";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9",
    },
    secondary: {
      main: "#f48fb1",
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b0bec5",
    },
  },
});

const ProfileSetup = () => {
  // UseStates **********************************************************************
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    profilePhotoUrl: "",
    profilePhotoFile: null,
    bio: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setConfirmShowPassword] = useState(false);
  const [isSubmiting, setIsSubmiting] = useState(false);

  //constants *********************************************************************
  const steps = ["Profile Setup", "Bio", "Password"];
  const isConfirmPasswordDisabled =
    formData.password === "" || formData.password.length < 6;
  const isPasswordMatch = formData.password === formData.confirmPassword;

  // Functions *********************************************************************
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    setFormErrors({ ...formErrors, [e.target.name]: "" });
    // Check for password length and match confirm password ***************
    if (name === "password" && value.length < 6) {
      setFormErrors((prev) => ({
        ...prev,
        password: "Password must be at least 6 characters.",
      }));
    } else if (name === "password") {
      setFormErrors((prev) => ({
        ...prev,
        password: "",
      }));
    }

    if (name === "confirmPassword") {
      if (value !== formData.password) {
        setFormErrors((prev) => ({
          ...prev,
          confirmPassword: "Passwords do not match.",
        }));
      } else {
        setFormErrors((prev) => ({
          ...prev,
          confirmPassword: "",
        }));
      }
    }
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      profilePhotoFile: e.target.files[0],
      profilePhotoUrl: URL.createObjectURL(e.target.files[0]),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep === 0) {
      if (formData.profilePhotoUrl) setCurrentStep(currentStep + 1);
      return;
    }
    if (currentStep === 1) {
      setCurrentStep(currentStep + 1);
      return;
    }
    console.log(currentStep);
    console.log("Form Submitted:", formData);
    setIsSubmiting(true);
    const toastId = toast.loading("Submiting...");
    const dataToSend = {
      channelName: formData.name,
      profilePhotoFile: formData.profilePhotoFile,
      profilePhotoUrl: formData.profilePhotoUrl,
      bio: formData.bio,
      password: formData.password,
    };

    // const dataToSend = new FormData();
    // dataToSend.append("channelName", formData.name);
    // dataToSend.append("profilePhotoFile", formData.profilePhotoFile);
    // dataToSend.append("bio", formData.bio);
    // dataToSend.append("profilePhotoUrl", formData.profilePhotoUrl);
    // dataToSend.append("password", formData.password);

    console.log(dataToSend);
    try {
      const data = await axios.post(
        "http://localhost:3000/api/v1/channel/update-profile",
        dataToSend,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Submited", { id: toastId });
    } catch (error) {
      console.log(error);
      toast.error(error || "Something went wrong", { id: toastId });
    }
    setIsSubmiting(false);
  };

  const getChannelInfo = async () => {
    const toatId = toast.loading("Fetching channel info...");
    try {
      const channel = await axios.get(
        "http://localhost:3000/api/v1/auth/channel",
        {
          withCredentials: true,
        }
      );
      setFormData({
        ...formData,
        name: channel.data.channelName,
        profilePhotoUrl: channel.data.profilePhoto.toString(),
      });
      toast.success("Channel info fetched successfully", { id: toatId });
    } catch (error) {
      console.log("Error fetching channel info", error);
      toast.error("Error fetching channel info", { id: toatId });
    }
  };

  useEffect(() => {
    getChannelInfo();
  }, []);

  return (
    // <ThemeProvider theme={darkTheme}>
    //   <CssBaseline />
    <Box
      className="profile-setup-container  bg-gradient-to-r from-youtube-dark-blue to-youtube-dark-red"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Box
        className="card"
        sx={{
          padding: 4,
          borderRadius: 2,
          boxShadow: 5,
          width: "70vh",
          minHeight: "498px",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#573c3c1a",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Stepper */}
        <Stepper activeStep={currentStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={index}>
              <StepLabel />
            </Step>
          ))}
        </Stepper>

        {/* Form */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ flex: 1, display: "flex", flexDirection: "column", mt: 3 }}
        >
          {currentStep === 0 && (
            <Box className="form-step">
              <Typography
                variant="h6"
                mb={4}
                sx={{
                  textAlign: "center",
                  fontWeight: "600",
                }}
              >
                Profile Setup
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  mb: "auto",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    position: "relative",
                  }}
                >
                  <Avatar
                    sx={{
                      width: 150,
                      height: 150,
                      border: "3px solid black",
                    }}
                    src={
                      formData.profilePhotoUrl ? formData.profilePhotoUrl : null
                    }
                  >
                    <AccountCircle
                      sx={{
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  </Avatar>
                  <IconButton
                    color="primary"
                    aria-label="upload picture"
                    component="label"
                    sx={{
                      position: "absolute",
                      bottom: "-20px",
                      right: "54px",
                      border: "1px solid grey",
                      bgcolor: "#000000a3",
                      ":hover": {
                        bgcolor: "#000000",
                      },
                    }}
                  >
                    <input
                      hidden
                      accept="image/*"
                      type="file"
                      onChange={handleFileChange}
                    />
                    <PhotoCamera
                      sx={{
                        color: "white",
                      }}
                    />
                  </IconButton>
                </Box>
                <TextField
                  label="Channel Name"
                  name="name"
                  fullWidth
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Box>
            </Box>
          )}

          {currentStep === 1 && (
            <Box className="form-step">
              <Typography
                variant="h6"
                mb={4}
                sx={{
                  textAlign: "center",
                  fontWeight: "600",
                }}
              >
                Discription
              </Typography>
              <TextField
                label="What is your Channel all about"
                name="bio"
                multiline
                rows={4}
                fullWidth
                value={formData.bio}
                onChange={handleChange}
              />
            </Box>
          )}

          {currentStep === 2 && (
            <Box className="form-step">
              <Typography
                variant="h6"
                mb={4}
                sx={{
                  textAlign: "center",
                  fontWeight: "600",
                }}
              >
                Password
              </Typography>

              <Box className="flex flex-col gap-4">
                {/* Password Field */}
                <TextField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  fullWidth
                  value={formData.password}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                  onChange={handleChange}
                  required
                  margin="normal"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword((e) => !e)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                {/* Confirm Password Field */}
                <TextField
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  fullWidth
                  value={formData.confirmPassword}
                  error={!!formErrors.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isConfirmPasswordDisabled}
                  margin="normal"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setConfirmShowPassword((e) => !e)}
                            edge="end"
                          >
                            {showConfirmPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    borderColor: isPasswordMatch ? "green" : "",
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": {
                        borderColor: isPasswordMatch ? "green" : "",
                      },
                    },
                  }}
                />
              </Box>
            </Box>
          )}

          {/* Navigation Buttons */}
          <Box
            className="button-group"
            sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
          >
            {currentStep > 0 && (
              <Button
                variant="outlined"
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={isSubmiting}
              >
                Previous
              </Button>
            )}
            {currentStep < 2 ? (
              <Button
                variant="contained"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!formData.name || !formData.profilePhotoUrl}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                type="submit"
                sx={{
                  bgcolor: "green",
                }}
                disabled={!isPasswordMatch || !formData.password || isSubmiting}
              >
                Submit
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ProfileSetup;
