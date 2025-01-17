
import React from 'react'
import { useRef, useState, useEffect } from 'react'
import { Box, Button, Checkbox, FormControlLabel, FormLabel, MenuItem, Radio, RadioGroup, TextField } from '@mui/material'
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import { CATEGORY_ENUM, GET_CHANNEL_DETAILS, UPDATE_VIDEO_INFO } from '../../utils/constants';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import toast from 'react-hot-toast';
import SaveIcon from '@mui/icons-material/Save';
import { convertLength } from '@mui/material/styles/cssUtils';
import axios from 'axios';
import { useAppStore } from '../../store';

const UpdateVideo = () => {

    const { channelInfo, setChannelInfo } = useAppStore()
    useEffect(() => {

        try {
            axios
                .get(GET_CHANNEL_DETAILS, { withCredentials: true })
                .then((res) => {
                    // console.log(res.data);
                    setChannelInfo(res.data)
                    // console.log(channelInfo)
                });


        } catch (err) {
            console.log(err);
        }
    }, []);


    const [isActive, setIsActive] = useState([false, false])
    const [videoUploaded, setVideoUploaded] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);

    const [videoDetails, setVideoDetails] = useState(
        {
            title: "", description: "", category: "others", thumbnailFile: null, duration: 0, videoFile: null, canComment: "true", isPrivate: "false"
        })

    const videoUploadRef = useRef()
    const photoUploadRef = useRef()
    let file = null
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const titleBoxRef = useRef(null);
    const descBoxRef = useRef(null);

    const handleSubmit = async () => {

        if (!videoDetails.title || !videoDetails.thumbnailFile || !videoDetails.videoFile) {
            toast.error("something's wrong")
        }
        console.log(videoDetails.thumbnailFile)
        console.log(videoDetails.videoFile)
        console.log(channelInfo)
        const formData = new FormData();
        formData.append('title', videoDetails.title);
        formData.append('description', videoDetails.description);
        formData.append('category', videoDetails.category);
        formData.append('thumbnail', videoDetails.thumbnailFile);
        formData.append('video', videoDetails.videoFile);
        formData.append('isPrivate', videoDetails.isPrivate);
        formData.append('canComment', videoDetails.canComment);
        formData.append('channelId', channelInfo._id)

        const response = await axios.post(UPDATE_VIDEO_INFO, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }, withCredentials: true
        })

        console.log(response.data)

    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (titleBoxRef.current && !titleBoxRef.current.contains(event.target)) {
                setIsActive((prev) => [false, prev[1]]);
            }
            if (descBoxRef.current && !descBoxRef.current.contains(event.target)) {
                setIsActive((prev) => [prev[0], false]);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleFocus = (index) => {
        const updatedActive = [...isActive];
        updatedActive[index] = true;
        setIsActive(updatedActive);
    };

    const handleAttachmentClick = () => {
        if (videoUploaded) {
            photoUploadRef.current.click()
        }
        else {
            videoUploadRef.current.click()
        }
    }

    const handleVideoUpload = (e) => {
        file = e.target.files[0]
        // console.log(file)
        setVideoDetails((prev) => ({ ...prev, videoFile: file }))
        const videoURL = URL.createObjectURL(file);
        const video = videoRef.current;
        video.src = videoURL;

        video.addEventListener('loadedmetadata', () => {
            video.currentTime = 1; // Seek to 1 second
            // setVideo(video.duration);
            setVideoDetails((prevDetails) => ({ ...prevDetails, duration: video.duration }))
        });

        video.addEventListener('seeked', () => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const thumbnailFile = new File([blob], "thumbnail.jpg", { type: "image/jpeg" });
                        // Save the thumbnail file in state or handle it
                        setImageSrc(URL.createObjectURL(thumbnailFile))
                        setVideoDetails((prevDetails) => ({ ...prevDetails, thumbnailFile: thumbnailFile }));
                    }
                },
                "image/jpeg",
                0.8 // JPEG quality (optional, between 0 and 1)
            );
        })
        setVideoUploaded(true);
    }

    const handlePhotoUpload = (e) => {
        file = e.target.files[0]
        setImageSrc(URL.createObjectURL(file))
        setVideoDetails((prevDetails) => ({ ...prevDetails, thumbnailFile: file }))

    }

    return (
        <Box className="bg-gradient-to-r from-youtube-dark-blue to-youtube-dark-red" sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            minHeight: "100vh",
            padding: 2,

        }}>
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
                        xs: '100%',  // 100% width on extra small screens
                        sm: '80%',   // 80% width on small screens
                        md: '80%',   // 60% width on medium screens
                        // lg: '70%',   // 40% width on large screens
                    },
                    transition: 'width 0.3s ease',
                }}>
                <Box
                    component="form"
                    sx={{
                        display: "flex", flexDirection: "row", gap: 3, "@media (max-width: 1050px)": {
                            flexDirection: "column"
                        },
                    }}>

                    <Box sx={{
                        display: "flex", flexDirection: "column", gap: 2, width: { md: "40%" }, "@media (max-width: 1050px)": {
                            width: "100%"
                        },
                    }}>
                        <Box sx={{ gap: 2, justifyContent: "center", display: "flex", alignItems: "center" }}>
                            <Box sx={{
                                borderRadius: "30px",
                                width: "340px",
                                backgroundColor: "#573c3c1a",
                                backdropFilter: "blur(40px)",
                                height: "200px",
                                flexShrink: "0",
                                overflow: 'hidden', // Prevent content from overflowing and changing the size

                            }}>
                                {videoUploaded ? (
                                    <div className='overflow-hidden w-full h-full rounded-lg relative'>
                                        <img src={imageSrc} className='border w-full h-full object-cover rounded-lg'
                                            style={{
                                                border: "2px solid white",
                                                borderRadius: "30px"
                                            }} />
                                        <div
                                            className='absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded'
                                            style={{ fontSize: '12px' }}>
                                            {new Date(videoDetails.duration * 1000).toISOString().substr(11, 8)}
                                        </div>
                                    </div>) :
                                    (
                                        <div className='w-full h-full rounded-lg flex justify-center cursor-pointer items-center' onClick={handleAttachmentClick}>
                                            Upload video here
                                            <input className='hidden' type="file" ref={videoUploadRef} onChange={handleVideoUpload} />
                                        </div>
                                    )}
                                <video ref={videoRef} style={{ display: 'none' }} />
                                <canvas ref={canvasRef} style={{ display: 'none' }} />
                            </Box>
                        </Box>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, justifyContent: "center", alignItems: "center" }}>
                            <Box onClick={handleAttachmentClick} className="pt-5 pb-5">
                                <AddAPhotoIcon sx={{ marginRight: "10px" }} />Change thumbnail
                            </Box>
                            <input type="file" className='hidden' ref={photoUploadRef} onChange={handlePhotoUpload} />
                            <Box>
                                <TextField
                                    id="category"
                                    select
                                    value={videoDetails.category}
                                    onChange={(event) => setVideoDetails((prev) => ({ ...prev, category: event.target.value }))}
                                    label="Video Category"
                                    // defaultValue="others"
                                    helperText="Please select category for your video"
                                    fullWidth
                                    InputProps={{
                                        classes: { notchedOutline: 'custom-outline' },
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'white',
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'white',
                                            },
                                        },
                                        '& .MuiInputLabel-root': {
                                            color: 'white',
                                        },
                                        '& .MuiFormHelperText-root': {
                                            color: '#e5e7eb',
                                        },
                                    }}>
                                    {CATEGORY_ENUM.map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                        <h2 className='font-roboto text-2xl font-semibold mb-3 ml-2'> Video Details</h2>

                        <Box
                            ref={titleBoxRef}
                            className={`flex flex-col border-2 rounded-lg p-2 gap-1 w-full ${isActive[0] ? 'border-white' : 'border-[#757a7c]'}`}
                            onClick={() => handleFocus(0)}>
                            <h3 className='text-[#dadfe1]'>Title</h3>
                            <textarea
                                className="w-full border-none rounded-md focus:outline-none focus:ring-0 overflow-y-auto resize-none bg-transparent"
                                rows="2"
                                value={videoDetails.title}
                                onChange={(event) => setVideoDetails((prev) => ({ ...prev, title: event.target.value }))}
                                placeholder="Add a title that describes your video"
                                onFocus={() => handleFocus(0)} />
                        </Box>

                        <Box
                            ref={descBoxRef}
                            className={`flex flex-col border-2 rounded-lg p-2 gap-1 w-full ${isActive[1] ? 'border-white' : 'border-[#757a7c]'}`}
                            onClick={() => handleFocus(1)}>
                            <h3 className='text-[#dadfe1]'>Description</h3>
                            <textarea
                                className="w-full border-none rounded-md focus:outline-none focus:ring-0 overflow-y-auto resize-none bg-transparent"
                                rows="5"
                                value={videoDetails.description}
                                onChange={(event) => setVideoDetails((prev) => ({ ...prev, description: event.target.value }))}
                                placeholder="Tell viewers about your video"
                                onFocus={() => handleFocus(1)} />
                        </Box>

                        <Box className="flex flex-col gap-2 w-full">
                            <Box>
                                <FormLabel component="legend" sx={{ color: "#dadfe1" }}>Video visibility</FormLabel>
                                <RadioGroup
                                    row
                                    aria-labelledby="demo-form-control-label-placement"
                                    name="position"
                                    defaultValue="false"
                                    value={videoDetails.isPrivate}
                                    onChange={(event) => setVideoDetails((prev) => ({ ...prev, isPrivate: event.target.value }))}
                                    sx={{ color: "#dadfe1" }}>
                                    <FormControlLabel value="false" control={<Radio />} label="Public" />
                                    <FormControlLabel
                                        value="true"
                                        control={<Radio />}
                                        label="Private"
                                        labelPlacement="start"
                                        sx={{ color: "#dadfe1" }} />
                                </RadioGroup>
                            </Box>
                            <Box className="flex justify-between items-center">
                                <FormControlLabel
                                    control={<Checkbox id='canComment' onChange={(event) => setVideoDetails((prev) => ({ ...prev, canComment: event.target.checked ? "true" : "false" }))} defaultChecked color="default" />}
                                    label="Allow comments"
                                    sx={{ color: "#dadfe1" }} />
                                <Button
                                    color="default"
                                    component="label"
                                    variant="contained"
                                    // loading
                                    // loadingPosition="end"
                                    onClick={handleSubmit}
                                    startIcon={<CloudUploadIcon />}>
                                    Upload video
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default UpdateVideo
