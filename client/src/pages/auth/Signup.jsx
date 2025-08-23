import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import GoogleIcon from "@mui/icons-material/Google";
import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import api from "../../utils/api.js";
import toast from "react-hot-toast";

import { GOOGLE_LOGIN_URL, LOGIN_ROUTE } from "../../utils/constants";
import { useAppStore } from "../../store";

export const Signup = () => {
  const navigate = useNavigate();
  const { setIsLoggedIn, isLoggedIn, setChannelInfo } = useAppStore();

  // Remove scrollbars from body when component mounts
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    };
  }, []);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Validation state
  const [validEmail, setValidEmail] = useState(true);
  const [validPassword, setValidPassword] = useState(true);
  const [formErrors, setFormErrors] = useState({
    password: "",
    email: "",
  });

  // Loading state
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Constants
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const MIN_PASSWORD_LENGTH = 6;

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "email") {
      setEmail(value);
      setFormErrors((prev) => ({ ...prev, email: "" }));

      // Validate email format
      if (value.length > 0) {
        const isValidEmail = emailRegex.test(value);
        setValidEmail(isValidEmail);

        if (!isValidEmail) {
          setFormErrors((prev) => ({
            ...prev,
            email: "Please enter a valid email address",
          }));
        }
      } else {
        setValidEmail(true); // Reset validation when empty
      }
    } else if (name === "password") {
      setPassword(value);
      setFormErrors((prev) => ({ ...prev, password: "" }));

      const isValid = value.length >= MIN_PASSWORD_LENGTH;
      setValidPassword(isValid);

      if (!isValid) {
        setFormErrors((prev) => ({
          ...prev,
          password: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
        }));
      }
    }
  };

  // Handle regular email/password login
  const handleLogin = async () => {
    if (!email || !password || !validEmail || !validPassword) {
      toast.error("Please fill in all fields correctly");
      return;
    }

    setIsLoggingIn(true);
    const toastId = toast.loading("Logging in...");

    try {
      const { data } = await api.post(LOGIN_ROUTE, { email, password });

      // Store tokens in localStorage
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      // Set channel info and login state
      if (data?.channel) {
        setChannelInfo(data.channel);
        setIsLoggedIn(true);
      }

      toast.success("User logged in successfully", { id: toastId });
      navigate("/");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      toast.error(errorMessage, { id: toastId });
      setIsLoggedIn(false);
      setChannelInfo(null);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Google OAuth login handler
  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      setIsLoggingIn(true);
      const toastId = toast.loading("Logging in with Google...");

      try {
        const { data } = await api.post(GOOGLE_LOGIN_URL, {
          accessToken: response.access_token,
        });

        // Store tokens in localStorage
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        // Set channel info and login state
        if (data?.channel) {
          setChannelInfo(data.channel);
          setIsLoggedIn(true);
        }

        toast.success("Logged in successfully!", { id: toastId });
        navigate("/");
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          "Google login failed. Please try again.";
        toast.error(errorMessage, { id: toastId });
        setIsLoggedIn(false);
        setChannelInfo(null);
      } finally {
        setIsLoggingIn(false);
      }
    },
    onError: () => {
      toast.error("Google login failed. Please try again.");
      setIsLoggingIn(false);
    },
  });

  // Check if form is valid for submission
  const isFormValid =
    validEmail && validPassword && email.length > 0 && password.length > 0;

  return (
    <div className="flex lg:flex-row flex-col bg-gradient-to-r from-youtube-dark-blue to-youtube-dark-red h-screen w-screen overflow-hidden">
      {/* Background image for large screens */}
      <div className="hidden lg:block lg:flex-shrink-0">
        <img
          src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.svg"
          className="w-[60vw] p-20"
          alt="Login illustration"
        />
      </div>

      {/* Login Card */}
      <div className="flex flex-col w-full lg:w-[40vw] h-full justify-center items-center overflow-y-auto">
        <Box
          className="card"
          sx={{
            padding: 4,
            borderRadius: 2,
            boxShadow: 5,
            width: "90%",
            maxWidth: "470px",
            minHeight: "550px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly",
            alignItems: "center",
            backgroundColor: "#573c3c1a",
            backdropFilter: "blur(10px)",
          }}
        >
          <Typography
            variant="h6"
            mb={2}
            mt={2}
            sx={{
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            Login
          </Typography>

          {/* Email Field */}
          <div className="space-y-8 max-w-md mx-auto w-[90%]">
            <TextField
              label="Email"
              required
              variant="outlined"
              name="email"
              type="email"
              value={email}
              onChange={handleChange}
              sx={{ width: "100%" }}
              error={!validEmail}
              helperText={formErrors.email}
            />
          </div>

          {/* Password Field */}
          <div className="space-y-8 max-w-md mx-auto w-[90%]">
            <TextField
              label="Password"
              required
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={handleChange}
              variant="outlined"
              sx={{ width: "100%" }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              error={!validPassword}
              helperText={formErrors.password}
            />
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="w-[80%] flex justify-between items-center">
            <FormControlLabel
              control={<Checkbox defaultChecked />}
              label="Remember me"
              sx={{
                "& .MuiFormControlLabel-label": {
                  fontSize: "0.9rem",
                },
              }}
            />
            <a href="#" className="text-blue-900 hover:underline">
              Forgot Password?
            </a>
          </div>

          {/* Login Button */}
          <Button
            variant="contained"
            sx={{
              width: "90%",
              height: "50px",
              padding: "10px",
              fontSize: "1rem",
              backgroundColor: "rgb(59, 113, 182)",
              "&:hover": {
                backgroundColor: "rgb(48, 92, 148)",
              },
            }}
            onClick={handleLogin}
            disabled={!isFormValid || isLoggingIn}
          >
            {isLoggingIn ? "Logging in..." : "Log In"}
          </Button>

          {/* Divider */}
          <div className="flex items-center w-[60%]">
            <div className="flex-grow border-t border-[#e5e7eb]"></div>
            <div className="mx-4 text-white font-semibold">OR</div>
            <div className="flex-grow border-t border-[#e5e7eb]"></div>
          </div>

          {/* Google Login Button */}
          <div className="w-full flex justify-center">
            <Button
              variant="contained"
              sx={{
                width: "100%",
                height: "50px",
                fontSize: "1rem",
                padding: "10px",
                backgroundColor: "rgb(59, 113, 182)",
                "&:hover": {
                  backgroundColor: "rgb(48, 92, 148)",
                },
              }}
              disabled={isLoggingIn}
              onClick={googleLogin}
            >
              <GoogleIcon fontSize="large" color="action" className="pr-3" />
              Continue with Google
            </Button>
          </div>
        </Box>
      </div>
    </div>
  );
};

export default Signup;
