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
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const cardRef = useRef(null);
  const videoRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const videoElement = cardRef.current;
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

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progressValue =
        (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progressValue);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const skip10Seconds = () => {
    if (videoRef.current) {
      videoRef.current.currentTime += 10;
    }
  };

  return (
    <div
      ref={cardRef}
      // onClick={() => navigate("/vid")}
      className="video-card"
      style={{
        height: "320px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
      onMouseEnter={() => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

        hoverTimeoutRef.current = setTimeout(() => {
          setIsHovered(true);
          handleHover();
        }, 300);
      }}
      onMouseLeave={() => {
        // Clear the timeout on mouse leave
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

        setIsHovered(false);
        handleMouseLeave();
      }}
    >
      <div
        style={{
          height: "70%",
        }}
        className={`video-card-thumbnail ${
          isHovered ? "thumbnail-transition" : ""
        }`}
      >
        {isInView && (
          <div
            className={`video-container ${isHovered ? "hovered" : ""}`}
            style={{
              position: "relative",
              width: "100%",
            }}
          >
            <video
              ref={videoRef}
              src={videoUrl} // Start loading the video when in view
              muted={isMuted}
              onTimeUpdate={handleTimeUpdate}
              controls={false}
              loop
              className={`video-preview ${isHovered ? "hovered" : ""}`}
              preload="auto"
              style={{
                width: "100%",
                height: "100%",
                minHeight: "186.425px",
              }}
            ></video>
            {isHovered && (
              <div
                style={{
                  position: "absolute",
                  height: "100%",
                  width: "100%",
                  top: 0,
                  // backgroundColor: "blue",
                }}
              >
                {/* Progress Bar */}
                <div
                  className="progress-bar"
                  style={{
                    width: "100%",
                    height: "3px",
                    backgroundColor: "#7f7f7f",
                    position: "absolute",
                    bottom: "0",
                    zIndex: "1",
                  }}
                >
                  <div
                    className="progress"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: "red",
                      height: "3px",
                      // borderRadius: "20px",
                      position: "absolute",
                      bottom: "0px",
                      zIndex: "4",
                    }}
                  ></div>
                </div>

                {/* Mute/Unmute Button */}
                {/* <div
                  className="buttones"
                  style={{
                    position: "absolute",
                    top: "0",
                  }}
                >
                  <button
                    className="mute-button"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent click propagation
                      toggleMute();
                    }}
                  >
                    {isMuted ? "Unmute" : "Mute"}
                  </button>

                  <button
                    className="skip-button"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent click propagation
                      skip10Seconds();
                    }}
                  >
                    +10s
                  </button>
                </div> */}
              </div>
            )}
          </div>
        )}
        <img
          src={thumbnail}
          alt={title}
          className={`thumbnail ${isHovered ? "hidden" : ""}`}
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
          }}
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
