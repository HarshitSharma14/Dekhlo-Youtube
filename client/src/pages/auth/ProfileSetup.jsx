//  React and State Management
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

//  Third-party Libraries
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";

//  MUI Components & Icons
import {
  Avatar,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";

import {
  Visibility,
  VisibilityOff,
  AccountCircle,
  PhotoCamera,
} from "@mui/icons-material";

//  Project Constants, Styles, and Stores
import { UPDATE_CHANNEL_INFO_ROUTE } from "../../utils/constants";
import { useAppStore } from "../../store";
import "./ProfileSetup.css";

const ProfileSetup = () => {
  const steps = ["Profile Setup", "Discription", "Password"];
  const [currentStep, setCurrentStep] = useState(0);

  const { channelInfo } = useAppStore();

  const formHandler = useForm({
    mode: "onChange",
    defaultValues: {
      name: channelInfo.channelName,
      profilePhotoUrl: channelInfo.profilePhoto,
      bio: channelInfo.bio,
    },
  });

  const {
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = formHandler;

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    if (currentStep < steps?.length - 1) {
      setCurrentStep(currentStep + 1);
      return;
    }
    const toastId = toast.loading("Submiting...");

    const dataToSend = new FormData();

    dataToSend.append("channelName", data.name);
    dataToSend.append("profilePhotoFile", data.profilePhotoFile?.[0]);
    dataToSend.append("bio", data.bio);
    dataToSend.append("profilePhotoUrl", data?.profilePhotoUrl);
    dataToSend.append("password", data.password);

    try {
      console.log(UPDATE_CHANNEL_INFO_ROUTE);

      const data = await axios.post(UPDATE_CHANNEL_INFO_ROUTE, dataToSend, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("submitted ", data);
      toast.success("Submited successfully", { id: toastId });
      navigate("/");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong", {
        id: toastId,
      });
    }
  };

  return (
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
        <Stepper
          activeStep={currentStep}
          alternativeLabel
          sx={{
            ".MuiStepLabel-label": {
              color: "rgba(255, 255, 255, 0.7)", // Label color for dark theme
            },
            ".MuiStepIcon-root": {
              color: "rgba(255, 255, 255, 0.5)", // Default step icon color
            },
            ".MuiStepIcon-root.Mui-active": {
              color: "#4caf50", // Active step icon color
            },
            ".MuiStepIcon-root.Mui-completed": {
              color: "#2e7d32", // Completed step icon color
            },
          }}
        >
          {steps.map((label, index) => (
            <Step key={index}>
              <StepLabel />
            </Step>
          ))}
        </Stepper>

        {/* Form */}
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ flex: 1, display: "flex", flexDirection: "column", mt: 3 }}
        >
          <FormWrapper
            steps={steps}
            currentStep={currentStep}
            formHandler={formHandler}
          />
          {/* Navigation Buttons */}
          <Box
            className="button-group"
            sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
          >
            {currentStep > 0 && (
              <Button
                variant="outlined"
                onClick={() => {
                  setCurrentStep(currentStep - 1);
                  setValue("confirmPassword", "");
                }}
                disabled={isSubmitting}
              >
                Previous
              </Button>
            )}
            {currentStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentStep(currentStep + 1);
                  return;
                }}
                disabled={
                  currentStep == 0
                    ? !watch("profilePhotoUrl")?.length || errors?.name
                    : watch("bio")?.length < 20 || errors?.bio
                }
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
                disabled={
                  !watch("password")?.length ||
                  !watch("confirmPassword")?.length ||
                  errors?.confirmPassword ||
                  isSubmitting
                }
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

const FormWrapper = ({ currentStep, formHandler, steps }) => {
  const formStep = () => {
    switch (currentStep) {
      case 0:
        return <FormStepOne formHandler={formHandler} />;

      case 1:
        return <FormStepTwo formHandler={formHandler} />;

      case 2:
        return <FormStepThree formHandler={formHandler} />;

      default:
        return <div> Out of Bound</div>;
    }
  };

  return (
    <Box className="form-step">
      <Typography
        variant="h6"
        mb={4}
        sx={{
          textAlign: "center",
          fontWeight: "600",
        }}
      >
        {steps[currentStep]}
      </Typography>

      {formStep()}
    </Box>
  );
};

const FormStepOne = ({ formHandler }) => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = formHandler;

  const selectedProfilePhotot = watch("profilePhotoFile");

  useEffect(() => {
    const file = watch("profilePhotoFile")?.[0];
    if (file) {
      const photoPreview = URL.createObjectURL(file);
      setValue("profilePhotoUrl", photoPreview);
    }
  }, [selectedProfilePhotot]);

  return (
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
          src={watch("profilePhotoUrl")}
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
            {...register("profilePhotoFile", {
              validate: (files) =>
                files?.length > 0 ||
                watch("profilePhotoUrl")?.length ||
                "Set Profile photo",
            })}
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
        error={!!errors?.name}
        helperText={errors?.name?.message}
        name="name"
        fullWidth
        {...register("name", {
          setValueAs: (value) => value.trim(),
          required: "Channel name is Requeired",
          maxLength: { value: 25, message: "Maximum 25 charaters allowed" },
        })}
      />
    </Box>
  );
};

const FormStepTwo = ({ formHandler }) => {
  const {
    register,
    formState: { errors },
  } = formHandler;

  return (
    <TextField
      label="What is your Channel all about"
      name="bio"
      multiline
      rows={4}
      fullWidth
      required
      error={!!errors?.bio}
      helperText={errors?.bio?.message}
      {...register("bio", {
        setValueAs: (value) => value.trim(),

        required: "Description is required",
        minLength: {
          value: 20,
          message: "Bio should contain atleast 20 characters",
        },
      })}
    />
  );
};

const FormStepThree = ({ formHandler }) => {
  const {
    register,
    formState: { errors },
    watch,
  } = formHandler;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // const password = watch("password");
  return (
    <Box className="flex flex-col gap-4">
      {/* Password Field */}
      <TextField
        label="Password"
        type={showPassword ? "text" : "password"}
        name="password"
        fullWidth
        error={!!errors?.password}
        helperText={errors?.password?.message}
        {...register("password", {
          required: "password required",
          minLength: {
            value: 6,
            message: "Password must be at least 6 characters",
          },
        })}
        required
        margin="normal"
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={(e) => setShowPassword((e) => !e)}
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
        error={!!errors?.confirmPassword}
        required
        {...register("confirmPassword", {
          minLength: 6,
          required: true,
          validate: (value) => value === watch("password") || "Error",
        })}
        margin="normal"
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword((e) => !e)}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{
          borderColor:
            watch("confirmPassword")?.length && !errors?.confirmPassword
              ? "green"
              : "",
          "& .MuiOutlinedInput-root": {
            "&.Mui-focused fieldset": {
              borderColor:
                watch("confirmPassword")?.length && !errors?.confirmPassword
                  ? "green"
                  : "",
            },
          },
        }}
      />
    </Box>
  );
};
