import React from "react";
import { useRef, useState, useEffect } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import {
  CATEGORY_ENUM,
  GET_CHANNEL_DETAILS,
  GET_VIDEO_DETAILS,
  UPDATE_VIDEO_INFO,
} from "../../utils/constants";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import toast from "react-hot-toast";
import SaveIcon from "@mui/icons-material/Save";
import { convertLength } from "@mui/material/styles/cssUtils";
import axios from "axios";
import { useAppStore } from "../../store";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

const UpdateVideo = () => {
  // const videoId = "678d1c9efd4f5b3f71a9f989";
  // const videoId = "";
  const [justEditVideo, setJustEditVideo] = useState(false);

  const navigate = useNavigate();
  const [query] = useSearchParams();
  const videoId = query.get("videoId");

  const { channelInfo } = useAppStore();

  // use states******************************************
  const [isActive, setIsActive] = useState([false, false]);
  const [videoUploaded, setVideoUploaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [videoDetails, setVideoDetails] = useState({
    title: "",
    description: "",
    category: "others",
    thumbnailFile: null,
    duration: 0,
    videoFile: null,
    canComment: "true",
    isPrivate: "false",
  });
  const [uploading, setUploading] = useState(false);

  // Runs only on mount
  console.log("channel ifno", channelInfo);
  // ************************************************useeffect to getvideo details after we have channel info
  useEffect(() => {
    const getVideoDetails = async () => {
      console.log(`${GET_VIDEO_DETAILS}/${videoId}`);
      if (!channelInfo || !videoId) return;

      try {
        const response = await axios.get(`${GET_VIDEO_DETAILS}/${videoId}`, {
          withCredentials: true,
        });
        console.log("Video Details Received:", response);
        console.log("vid detais", response.data);
        if (response.data.videoDetails.channel !== channelInfo._id) {
          navigate("/");
        }
        setJustEditVideo(true);

        setVideoDetails({
          title: response.data.videoDetails.title,
          description: response.data.videoDetails.description,
          category: response.data.videoDetails.category,
          thumbnailFile: null,
          duration: response.data.videoDetails.duration,
          videoFile: null,
          canComment: response.data.videoDetails.canComment ? "true" : "false",
          isPrivate: response.data.videoDetails.isPrivate,
        });

        setImageSrc(response.data.videoDetails.thumbnailUrl);

        setVideoUploaded(true);
      } catch (error) {
        console.log(error);
      }
    };

    getVideoDetails();
  }, [channelInfo, videoId]); // Runs whenever channelInfo or videoId changes

  //refs**********************************************
  const videoUploadRef = useRef();
  const photoUploadRef = useRef();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const titleBoxRef = useRef(null);
  const descBoxRef = useRef(null);

  let file = null;

  const handleSubmit = async () => {
    setUploading(true);

    if (
      (!videoDetails.thumbnailFile && !justEditVideo) ||
      (!videoDetails.videoFile && !justEditVideo)
    ) {
      toast.error("Upload the video");
      setUploading(false);
      return;
    }
    if (!videoDetails.title) {
      toast.error("Give a title to your video");
      setUploading(false);
      return;
    }

    console.log(videoDetails.thumbnailFile);
    console.log(videoDetails.videoFile);
    console.log(videoDetails);
    const formData = new FormData();
    formData.append("title", videoDetails.title);
    formData.append("description", videoDetails.description);
    formData.append("category", videoDetails.category);
    formData.append("thumbnail", videoDetails.thumbnailFile);
    formData.append("isPrivate", videoDetails.isPrivate);
    formData.append("canComment", videoDetails.canComment);
    formData.append("channelId", channelInfo._id);
    formData.append("duration", videoDetails.duration);
    formData.append("videoId", videoId);
    formData.append("video", videoDetails.videoFile);

    const toastId = toast.loading("Uploading video...");
    console.log("firs");
    formData.forEach((value, key) => {
      console.log(`${key}:`, value);
    });
    try {
      const response = await axios.post(UPDATE_VIDEO_INFO, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      console.log("in try");
      console.log(response.data);

      toast.success("Video uploaded successfully.", { id: toastId });
      navigate("/");
    } catch (e) {
      console.log("in cathc");
      toast.error(e.response?.data?.message || "Something went wrong", {
        id: toastId,
      });
    }
    setUploading(false);
    // console.log(response.data)
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (titleBoxRef.current && !titleBoxRef.current.contains(event.target)) {
        setIsActive((prev) => [false, prev[1]]);
      }
      if (descBoxRef.current && !descBoxRef.current.contains(event.target)) {
        setIsActive((prev) => [prev[0], false]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFocus = (index) => {
    const updatedActive = [...isActive];
    updatedActive[index] = true;
    setIsActive(updatedActive);
  };

  const handleAttachmentClick = () => {
    if (videoUploaded) {
      photoUploadRef.current.click();
    } else {
      videoUploadRef.current.click();
    }
  };

  const handleVideoUpload = (e) => {
    const videoFile = e.target.files[0];
    // console.log(file)
    setVideoDetails((prev) => ({ ...prev, videoFile: videoFile }));
    const videoURL = URL.createObjectURL(videoFile);
    const video = videoRef.current;
    video.src = videoURL;

    video.addEventListener("loadedmetadata", () => {
      video.currentTime = 1; // Seek to 1 second
      // setVideo(video.duration);
      setVideoDetails((prevDetails) => ({
        ...prevDetails,
        duration: video.duration,
      }));
    });

    video.addEventListener("seeked", () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const thumbnailFile = new File([blob], "thumbnail.jpg", {
              type: "image/jpeg",
            });
            // Save the thumbnail file in state or handle it
            setImageSrc(URL.createObjectURL(thumbnailFile));
            setVideoDetails((prevDetails) => ({
              ...prevDetails,
              thumbnailFile: thumbnailFile,
            }));
          }
        },
        "image/jpeg",
        0.8 // JPEG quality (optional, between 0 and 1)
      );
    });
    setVideoUploaded(true);
  };

  const handlePhotoUpload = (e) => {
    const thumbnailFile = e.target.files[0];
    setImageSrc(URL.createObjectURL(thumbnailFile));
    setVideoDetails((prevDetails) => ({
      ...prevDetails,
      thumbnailFile: thumbnailFile,
    }));
  };

  return (
    <Box
      className="bg-gradient-to-r from-youtube-dark-blue to-youtube-dark-red"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        minHeight: "100vh",
        padding: 2,
      }}
    >
      <Box
        className="flex flex-col"
        sx={{
          padding: 4,
          borderRadius: 2,
          boxShadow: 5,
          // width: { xs: "100%", sm: "90%", md: "70%" },
          minHeight: "550px",
          backgroundColor: "#573c3c1a",
          backdropFilter: "blur(10px)",
          gap: 3,
          width: {
            xs: "100%", // 100% width on extra small screens
            sm: "80%", // 80% width on small screens
            md: "80%", // 60% width on medium screens
            // lg: '70%',   // 40% width on large screens
          },
          transition: "width 0.3s ease",
        }}
      >
        <Box
          component="form"
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 3,
            "@media (max-width: 1050px)": {
              flexDirection: "column",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              width: { md: "40%" },
              "@media (max-width: 1050px)": {
                width: "100%",
              },
            }}
          >
            <Box
              sx={{
                gap: 2,
                justifyContent: "center",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  borderRadius: "30px",
                  width: "340px",
                  backgroundColor: "#573c3c1a",
                  backdropFilter: "blur(40px)",
                  height: "200px",
                  flexShrink: "0",
                  overflow: "hidden", // Prevent content from overflowing and changing the size
                }}
              >
                {videoUploaded ? (
                  <div className="overflow-hidden w-full h-full rounded-lg relative">
                    <img
                      src={imageSrc}
                      className="border w-full h-full object-cover rounded-lg"
                      style={{
                        border: "2px solid white",
                        borderRadius: "30px",
                      }}
                    />
                    <div
                      className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded"
                      style={{ fontSize: "12px" }}
                    >
                      {new Date(videoDetails.duration * 1000)
                        .toISOString()
                        .substr(11, 8)}
                    </div>
                  </div>
                ) : (
                  <div
                    className="w-full h-full rounded-lg flex justify-center cursor-pointer items-center"
                    onClick={handleAttachmentClick}
                  >
                    Upload video here
                    <input
                      className="hidden"
                      disabled={uploading || justEditVideo}
                      type="file"
                      accept="video/*"
                      ref={videoUploadRef}
                      onChange={handleVideoUpload}
                    />
                  </div>
                )}
                <video ref={videoRef} style={{ display: "none" }} />
                <canvas ref={canvasRef} style={{ display: "none" }} />
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Box onClick={handleAttachmentClick} className="pt-5 pb-5">
                <AddAPhotoIcon sx={{ marginRight: "10px" }} />
                Change thumbnail
              </Box>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                ref={photoUploadRef}
                disabled={uploading}
                onChange={handlePhotoUpload}
              />
              <Box>
                <TextField
                  id="category"
                  select
                  disabled={uploading}
                  value={videoDetails.category}
                  onChange={(event) =>
                    setVideoDetails((prev) => ({
                      ...prev,
                      category: event.target.value,
                    }))
                  }
                  label="Video Category"
                  // defaultValue="others"
                  helperText="Please select category for your video"
                  fullWidth
                  InputProps={{
                    classes: { notchedOutline: "custom-outline" },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "white",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "white",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "white",
                    },
                    "& .MuiFormHelperText-root": {
                      color: "#e5e7eb",
                    },
                  }}
                >
                  {CATEGORY_ENUM.map((option, index) => (
                    <MenuItem key={index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}
          >
            <h2 className="font-roboto text-2xl font-semibold mb-3 ml-2">
              {" "}
              Video Details
            </h2>

            <Box
              ref={titleBoxRef}
              className={`flex flex-col border-2 rounded-lg p-2 gap-1 w-full ${
                isActive[0] ? "border-white" : "border-[#757a7c]"
              }`}
              onClick={() => handleFocus(0)}
            >
              <h3 className="text-[#dadfe1]">Title</h3>
              <textarea
                disabled={uploading}
                className="w-full border-none rounded-md focus:outline-none focus:ring-0 overflow-y-auto resize-none bg-transparent"
                rows="2"
                value={videoDetails.title}
                onChange={(event) =>
                  setVideoDetails((prev) => ({
                    ...prev,
                    title: event.target.value,
                  }))
                }
                placeholder="Add a title that describes your video"
                onFocus={() => handleFocus(0)}
              />
            </Box>

            <Box
              ref={descBoxRef}
              className={`flex flex-col border-2 rounded-lg p-2 gap-1 w-full ${
                isActive[1] ? "border-white" : "border-[#757a7c]"
              }`}
              onClick={() => handleFocus(1)}
            >
              <h3 className="text-[#dadfe1]">Description</h3>
              <textarea
                disabled={uploading}
                className="w-full border-none rounded-md focus:outline-none focus:ring-0 overflow-y-auto resize-none bg-transparent"
                rows="5"
                value={videoDetails.description}
                onChange={(event) =>
                  setVideoDetails((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                placeholder="Tell viewers about your video"
                onFocus={() => handleFocus(1)}
              />
            </Box>

            <Box className="flex flex-col gap-2 w-full">
              <Box>
                <FormLabel component="legend" sx={{ color: "#dadfe1" }}>
                  Video visibility
                </FormLabel>
                <RadioGroup
                  disabled={uploading}
                  row
                  aria-labelledby="demo-form-control-label-placement"
                  name="position"
                  defaultValue="false"
                  value={videoDetails.isPrivate}
                  onChange={(event) =>
                    setVideoDetails((prev) => ({
                      ...prev,
                      isPrivate: event.target.value,
                    }))
                  }
                  sx={{ color: "#dadfe1" }}
                >
                  <FormControlLabel
                    value="false"
                    control={<Radio disabled={uploading} />}
                    label="Public"
                  />
                  <FormControlLabel
                    value="true"
                    control={<Radio disabled={uploading} />}
                    label="Private"
                    labelPlacement="start"
                    sx={{ color: "#dadfe1" }}
                  />
                </RadioGroup>
              </Box>
              <Box className="flex justify-between items-center">
                <FormControlLabel
                  disabled={uploading}
                  control={
                    <Checkbox
                      id="canComment"
                      checked={videoDetails.canComment === "true"}
                      onChange={(event) =>
                        setVideoDetails((prev) => ({
                          ...prev,
                          canComment: event.target.checked ? "true" : "false",
                        }))
                      }
                      color="default"
                    />
                  }
                  label="Allow comments"
                  sx={{ color: "#dadfe1" }}
                />
                <Button
                  disabled={uploading}
                  color="default"
                  component="label"
                  variant="contained"
                  // loading
                  // loadingPosition="end"
                  onClick={handleSubmit}
                  startIcon={<CloudUploadIcon />}
                >
                  Upload video
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UpdateVideo;
