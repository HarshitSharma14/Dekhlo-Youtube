import React, { useState, useEffect, useRef } from "react";
import "./VideoCard.css";
import { formatUploadTime } from "../utils/helper.js";
import { useNavigate } from "react-router-dom";

const VideoCard = ({
  id,
  thumbnail,
  title,
  channelName,
  views,
  uploadTime,
  channelProfile,
  videoUrl,

}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef(null);
  const videoRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const videoElement = cardRef.current;
    console.log(videoElement);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true); // Start loading video only when in view
        } else {
          setIsInView(false); // Stop loading video if not in view
        }
      },
      {
        threshold: 0.25,
      }
    );

    if (videoElement) {
      observer.observe(videoElement);
    }

    return () => {
      if (videoElement) {
        observer.unobserve(videoElement);
      }
    };
  }, []);

  const handleHover = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };
  return (
    <div
      ref={cardRef}
      onClick={() => navigate(`/video-player/${id}`)}
      className="video-card"
      onMouseEnter={() => {
        setTimeout(() => {
          setIsHovered(true);
          handleHover();
        }, 400);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        handleMouseLeave();
      }}
    >
      <div className="video-card-thumbnail">
        {isInView && (
          <video
            ref={videoRef}
            src={videoUrl} // Start loading the video when in view
            muted
            // controls
            loop
            className={`video-preview ${isHovered ? "hovered" : ""}`}
            preload="auto" // Preload the video to allow buffering
            style={{
              width: "100%",
              height: "100%",
              minHeight: "186.425px",
            }}
          ></video>
        )}
        <img
          src={thumbnail}
          alt={title}
          className={`thumbnail ${isHovered ? "hidden" : ""}`}
          loading="lazy"
        />
      </div>

      <div className="video-card-info">
        <div className="video-card-avatar">
          <img
            src={channelProfile}
            alt={channelName}
            className="channel-avatar"
          />
        </div>
        <div className="video-card-details">
          <h3 className="video-card-title">{title}</h3>
          <div className="meta">
            <p className="video-card-channel">{channelName}</p>
            <p className="video-card-meta">
              {views} views • {formatUploadTime(uploadTime)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
