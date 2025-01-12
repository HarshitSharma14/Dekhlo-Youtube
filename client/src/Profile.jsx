import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Avatar,
  IconButton,
  CssBaseline,
  InputAdornment,
  FormHelperText,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import AccountCircle from "@mui/icons-material/AccountCircle";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import "./ProfileSetup.css";

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
    profilePhotoUrl:
      "https://lh3.googleusercontent.com/a/ACg8ocJsHfMs1Aq_fSZqQPfoV84cH4AMATJ6Endmw6he3S97BwFXow=s96-c",
    profilePhotoFile: null,
    bio: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setConfirmShowPassword] = useState(false);

  //constants *********************************************************************
  const steps = ["Profile Setup", "Bio", "Password"];
  const isConfirmPasswordDisabled = formData.password === "";
  const isPasswordMatch = formData.password === formData.confirmPassword;

  // Functions *********************************************************************
  const handleNext = () => {
    let errors = { name: "", password: "" };

    if (currentStep === 0 && !formData.name) {
      errors.name = "Full Name is required.";
    }

    if (currentStep === 2 && !formData.password) {
      errors.password = "Password is required.";
    }
    setFormErrors(errors);

    // Proceed to the next step only if there are no errors
    if (!errors.name && !errors.password) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleChange = (e) => {
    setFormErrors({ ...formErrors, [e.target.name]: "" });
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });

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
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
      return;
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
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
                        formData.profilePhotoUrl
                          ? formData.profilePhotoUrl
                          : null
                      }
                    >
                      <AccountCircle />
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
                    label="Full Name"
                    name="name"
                    fullWidth
                    error={!!formErrors.name}
                    helperText={formErrors.name}
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
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
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
                    // helperText={formErrors.confirmPassword}
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
                >
                  Previous
                </Button>
              )}
              {currentStep < 2 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!formData.name}
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
                  disabled={!isPasswordMatch || !formData.password}
                >
                  Submit
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default ProfileSetup;
