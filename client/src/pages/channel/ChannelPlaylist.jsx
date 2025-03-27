import { Box, CircularProgress } from "@mui/material";
import React, { useEffect, useState } from "react";
import VideoCardLoading from "../../component/loadingLayouts/VideoCardLoading";
import { useParams } from "react-router-dom";
import PlaylistCard from "../../component/cards/PlaylistCard";
import axios from "axios";
import { GET_CHANNEL_PLAYLIST } from "../../utils/constants";

const ChannelPlaylist = () => {
  // useState ****************************************************************************
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setisLoading] = useState(false);

  // constants **************************************************************************
  const params = useParams();
  const { channelId } = params;

  // function *****************************************************************************
  const getChannelPlaylists = async () => {
    setisLoading(true);
    try {
      const { data } = await axios.get(`${GET_CHANNEL_PLAYLIST}/${channelId}`, {
        withCredentials: true,
      });
      console.log("channel playlist", data.playlists);
      setPlaylists(data.playlists);
    } catch (err) {
      console.log("something went wrong ", err);
    } finally {
      setisLoading(false);
    }
  };

  // useEffecte *************************************************************************
  useEffect(() => {
    getChannelPlaylists();
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
        {!playlists.length && isLoading ? (
          <VideoCardLoading />
        ) : (
          <>
            {!isLoading && playlists.length ? (
              <>
                {playlists.map((playlist) => (
                  <PlaylistCard
                    key={playlist?._id}
                    playlistId={playlist?._id}
                    videoId={playlist.videos[0]?._id}
                    title={playlist?.name}
                    videoCount={playlist?.videoCount}
                    mainThumbnail={playlist?.videos[0]?.thumbnailUrl}
                    secondaryThumbnails={playlist?.videos}
                  />
                ))}
              </>
            ) : (
              <></>
            )}
            {isLoading && playlists.length && (
              <div
                style={{
                  width: "100%",
                  position: "relative",
                  padding: "10px",
                  // backgroundColor: "yellow",
                  height: "40px",
                  justifyContent: "center",
                  justifyItems: "center",
                }}
              >
                <CircularProgress
                  sx={{
                    position: "relative",
                    left: "50%",
                  }}
                />
              </div>
            )}
          </>
        )}

        {!isLoading && !playlists.length && (
          <div
            style={{
              width: "100%",
              position: "relative",
              padding: "10px",
              // backgroundColor: "yellow",
              height: "40px",
              justifyContent: "center",
              justifyItems: "center",
            }}
          >
            <Box
              sx={{
                justifyContent: "center",
              }}
            >
              No playlists to show
            </Box>
          </div>
        )}
      </Box>
    </>
  );
};

export default ChannelPlaylist;
