import React from "react";
import "./VideoCard.css";

const VideoCard = ({ thumbnail, title, channelName, views, uploadTime }) => {
  return (
    <div className="video-card">
      {/* Thumbnail */}
      <div className="video-card-thumbnail">
        <img src={thumbnail} alt={title} />
      </div>

      {/* Video Info */}
      <div className="video-card-info">
        <div className="video-card-avatar">
          <img
            src={`https://ui-avatars.com/api/?name=${channelName}&size=128`}
            alt={channelName}
            className=" border-r-2"
          />
        </div>
        <div className="video-card-details">
          <h3 className="video-card-title">{title}</h3>
          <div className="meta">
            <p className="video-card-channel">{channelName}</p>
            <p className="video-card-meta">
              {views} views • {uploadTime}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
