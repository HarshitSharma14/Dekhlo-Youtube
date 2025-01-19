import React, { useEffect, useState } from "react";
import VideoCard from "../../component/VideoCard";
import { Box } from "@mui/material";
import axios from "axios";
import { GET_HOME_VIDEOS_ROUTE } from "../../utils/constants";
import { useNavigate } from "react-router-dom";
const videos = [
  {
    id: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cG9ydHJhaXR8ZW58MHx8MHx8fDA%3D",
    title: "How to Build a React App in 2023",
    channelName: "Code with Me",
    views: "1.2M",
    uploadTime: "1 week ago",
  },
  {
    id: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    title: "How to Build a React App in 2023",
    channelName: "Code with Me",
    views: "1.2M",
    uploadTime: "1 week ago",
  },
  {
    id: 2,
    thumbnail:
      "https://images.unsplash.com/photo-1526394931762-90052e97b376?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MTl8dVktVVh5eWU1aFV8fGVufDB8fHx8fA%3D%3D",
    title:
      "10 Amazing JavaScript Tricks You Didn't Know  but you should he he ehe",
    channelName: "JS Geek",
    views: "800K",
    uploadTime: "3 days ago",
  },
  {
    id: 2,
    thumbnail: "https://i.ytimg.com/vi/3JZ_D3ELwOQ/hqdefault.jpg",
    title:
      "10 Amazing JavaScript Tricks You Didn't Know  but you should he he ehe",
    channelName: "JS Geek",
    views: "800K",
    uploadTime: "3 days ago",
  },
  {
    id: 1,
    thumbnail:
      "https://andrewstuder.com/wp-content/uploads/2020/04/AF3I3830-scaled.jpg",
    title: "How to Build a React App in 2023",
    channelName: "Code with Me",
    views: "1.2M",
    uploadTime: "1 week ago",
  },
  {
    id: 2,
    thumbnail:
      "https://images.unsplash.com/7/hills.jpg?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8NHx1WS1VWHl5ZTVoVXx8ZW58MHx8fHx8",
    title:
      "10 Amazing JavaScript Tricks You Didn't Know  but you should he he ehe",
    channelName: "JS Geek",
    views: "800K",
    uploadTime: "3 days ago",
  },
  {
    id: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cG9ydHJhaXR8ZW58MHx8MHx8fDA%3D",
    title: "How to Build a React App in 2023",
    channelName: "Code with Me",
    views: "1.2M",
    uploadTime: "1 week ago",
  },
  {
    id: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    title: "How to Build a React App in 2023",
    channelName: "Code with Me",
    views: "1.2M",
    uploadTime: "1 week ago",
  },
  {
    id: 2,
    thumbnail:
      "https://images.unsplash.com/photo-1526394931762-90052e97b376?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MTl8dVktVVh5eWU1aFV8fGVufDB8fHx8fA%3D%3D",
    title:
      "10 Amazing JavaScript Tricks You Didn't Know  but you should he he ehe",
    channelName: "JS Geek",
    views: "800K",
    uploadTime: "3 days ago",
  },
  {
    id: 2,
    thumbnail: "https://i.ytimg.com/vi/3JZ_D3ELwOQ/hqdefault.jpg",
    title:
      "10 Amazing JavaScript Tricks You Didn't Know  but you should he he ehe",
    channelName: "JS Geek",
    views: "800K",
    uploadTime: "3 days ago",
  },
  {
    id: 1,
    thumbnail:
      "https://andrewstuder.com/wp-content/uploads/2020/04/AF3I3830-scaled.jpg",
    title: "How to Build a React App in 2023",
    channelName: "Code with Me",
    views: "1.2M",
    uploadTime: "1 week ago",
  },
  {
    id: 2,
    thumbnail:
      "https://images.unsplash.com/7/hills.jpg?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8NHx1WS1VWHl5ZTVoVXx8ZW58MHx8fHx8",
    title:
      "10 Amazing JavaScript Tricks You Didn't Know  but you should he he ehe",
    channelName: "JS Geek",
    views: "800K",
    uploadTime: "3 days ago",
  },
  {
    id: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cG9ydHJhaXR8ZW58MHx8MHx8fDA%3D",
    title: "How to Build a React App in 2023",
    channelName: "Code with Me",
    views: "1.2M",
    uploadTime: "1 week ago",
  },
  {
    id: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    title: "How to Build a React App in 2023",
    channelName: "Code with Me",
    views: "1.2M",
    uploadTime: "1 week ago",
  },
  {
    id: 2,
    thumbnail:
      "https://images.unsplash.com/photo-1526394931762-90052e97b376?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MTl8dVktVVh5eWU1aFV8fGVufDB8fHx8fA%3D%3D",
    title:
      "10 Amazing JavaScript Tricks You Didn't Know  but you should he he ehe",
    channelName: "JS Geek",
    views: "800K",
    uploadTime: "3 days ago",
  },
  {
    id: 2,
    thumbnail: "https://i.ytimg.com/vi/3JZ_D3ELwOQ/hqdefault.jpg",
    title:
      "10 Amazing JavaScript Tricks You Didn't Know  but you should he he ehe",
    channelName: "JS Geek",
    views: "800K",
    uploadTime: "3 days ago",
  },
  {
    id: 1,
    thumbnail:
      "https://andrewstuder.com/wp-content/uploads/2020/04/AF3I3830-scaled.jpg",
    title: "How to Build a React App in 2023",
    channelName: "Code with Me",
    views: "1.2M",
    uploadTime: "1 week ago",
  },
  {
    id: 2,
    thumbnail:
      "https://images.unsplash.com/7/hills.jpg?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8NHx1WS1VWHl5ZTVoVXx8ZW58MHx8fHx8",
    title:
      "10 Amazing JavaScript Tricks You Didn't Know  but you should he he ehe",
    channelName: "JS Geek",
    views: "800K",
    uploadTime: "3 days ago",
  },
  {
    id: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cG9ydHJhaXR8ZW58MHx8MHx8fDA%3D",
    title: "How to Build a React App in 2023",
    channelName: "Code with Me",
    views: "1.2M",
    uploadTime: "1 week ago",
  },
  {
    id: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    title: "How to Build a React App in 2023",
    channelName: "Code with Me",
    views: "1.2M",
    uploadTime: "1 week ago",
  },
  {
    id: 2,
    thumbnail:
      "https://images.unsplash.com/photo-1526394931762-90052e97b376?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MTl8dVktVVh5eWU1aFV8fGVufDB8fHx8fA%3D%3D",
    title:
      "10 Amazing JavaScript Tricks You Didn't Know  but you should he he ehe",
    channelName: "JS Geek",
    views: "800K",
    uploadTime: "3 days ago",
  },
  {
    id: 2,
    thumbnail: "https://i.ytimg.com/vi/3JZ_D3ELwOQ/hqdefault.jpg",
    title:
      "10 Amazing JavaScript Tricks You Didn't Know  but you should he he ehe",
    channelName: "JS Geek",
    views: "800K",
    uploadTime: "3 days ago",
  },
  {
    id: 1,
    thumbnail:
      "https://andrewstuder.com/wp-content/uploads/2020/04/AF3I3830-scaled.jpg",
    title: "How to Build a React App in 2023",
    channelName: "Code with Me",
    views: "1.2M",
    uploadTime: "1 week ago",
  },
  {
    id: 2,
    thumbnail:
      "https://images.unsplash.com/7/hills.jpg?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8NHx1WS1VWHl5ZTVoVXx8ZW58MHx8fHx8",
    title:
      "10 Amazing JavaScript Tricks You Didn't Know  but you should he he ehe",
    channelName: "JS Geek",
    views: "800K",
    uploadTime: "3 days ago",
  },
  {
    id: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cG9ydHJhaXR8ZW58MHx8MHx8fDA%3D",
    title: "How to Build a React App in 2023",
    channelName: "Code with Me",
    views: "1.2M",
    uploadTime: "1 week ago",
  },
  {
    id: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    title: "How to Build a React App in 2023",
    channelName: "Code with Me",
    views: "1.2M",
    uploadTime: "1 week ago",
  },
  {
    id: 2,
    thumbnail:
      "https://images.unsplash.com/photo-1526394931762-90052e97b376?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MTl8dVktVVh5eWU1aFV8fGVufDB8fHx8fA%3D%3D",
    title:
      "10 Amazing JavaScript Tricks You Didn't Know  but you should he he ehe",
    channelName: "JS Geek",
    views: "800K",
    uploadTime: "3 days ago",
  },
  {
    id: 2,
    thumbnail: "https://i.ytimg.com/vi/3JZ_D3ELwOQ/hqdefault.jpg",
    title:
      "10 Amazing JavaScript Tricks You Didn't Know  but you should he he ehe",
    channelName: "JS Geek",
    views: "800K",
    uploadTime: "3 days ago",
  },
  {
    id: 1,
    thumbnail:
      "https://andrewstuder.com/wp-content/uploads/2020/04/AF3I3830-scaled.jpg",
    title: "How to Build a React App in 2023",
    channelName: "Code with Me",
    views: "1.2M",
    uploadTime: "1 week ago",
  },
  {
    id: 2,
    thumbnail:
      "https://images.unsplash.com/7/hills.jpg?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8NHx1WS1VWHl5ZTVoVXx8ZW58MHx8fHx8",
    title:
      "10 Amazing JavaScript Tricks You Didn't Know  but you should he he ehe",
    channelName: "JS Geek",
    views: "800K",
    uploadTime: "3 days ago",
  },
  {
    id: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cG9ydHJhaXR8ZW58MHx8MHx8fDA%3D",
    title: "How to Build a React App in 2023",
    channelName: "Code with Me",
    views: "1.2M",
    uploadTime: "1 week ago",
  },
  {
    id: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHBvcnRyYWl0fGVufDB8fDB8fHww",
    title: "How to Build a React App in 2023",
    channelName: "Code with Me",
    views: "1.2M",
    uploadTime: "1 week ago",
  },
  {
    id: 2,
    thumbnail:
      "https://images.unsplash.com/photo-1526394931762-90052e97b376?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MTl8dVktVVh5eWU1aFV8fGVufDB8fHx8fA%3D%3D",
    title:
      "10 Amazing JavaScript Tricks You Didn't Know  but you should he he ehe",
    channelName: "JS Geek",
    views: "800K",
    uploadTime: "3 days ago",
  },
  {
    id: 2,
    thumbnail: "https://i.ytimg.com/vi/3JZ_D3ELwOQ/hqdefault.jpg",
    title:
      "10 Amazing JavaScript Tricks You Didn't Know  but you should he he ehe",
    channelName: "JS Geek",
    views: "800K",
    uploadTime: "3 days ago",
  },
  {
    id: 1,
    thumbnail:
      "https://andrewstuder.com/wp-content/uploads/2020/04/AF3I3830-scaled.jpg",
    title: "How to Build a React App in 2023",
    channelName: "Code with Me",
    views: "1.2M",
    uploadTime: "1 week ago",
  },
  {
    id: 2,
    thumbnail:
      "https://images.unsplash.com/7/hills.jpg?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8NHx1WS1VWHl5ZTVoVXx8ZW58MHx8fHx8",
    title:
      "10 Amazing JavaScript Tricks You Didn't Know  but you should he he ehe",
    channelName: "JS Geek",
    views: "800K",
    uploadTime: "3 days ago",
  },
];

const HomeContent = () => {

  //constants *******************************
  const navigate = useNavigate();

  // usestate ************************************************************************
  const [videos, setVideos] = useState([]);
  const [seenIds, setSeenIds] = useState([]);

  // functions **************************************************************************
  //                  <<----- fetch videos from backend
  const getVideos = async () => {
    try {
      console.log("seend", seenIds);
      const res = await axios.post(
        GET_HOME_VIDEOS_ROUTE,
        { seenIds },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(res.data);
      setVideos((e) => [...e, ...res.data?.videos]);
      setSeenIds((e) => [...e, ...res.data?.videos?.map((vid) => vid._id)]);
    } catch (error) {
      console.log("err", error);
    }
  };


  // use effect **********************************************************************************
  //                   <<----- Fetch data for the first time
  useEffect(() => {
    getVideos();
  }, []);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          "@media(max-width: 680px)": { justifyContent: "center" },
        }}

      >
        {videos.map((video) => (
          <VideoCard
            key={video?._id}
            id={video?._id}
            thumbnail={video?.thumbnailUrl}
            title={video?.title}
            channelName={video?.channel.channelName}
            views={video?.views}
            uploadTime={video?.createdAt}
            channelProfile={video?.channel.profilePhoto}
            videoUrl={video?.videoUrl}
          />
        ))}
      </Box>
    </>
  );
};

export default HomeContent;
