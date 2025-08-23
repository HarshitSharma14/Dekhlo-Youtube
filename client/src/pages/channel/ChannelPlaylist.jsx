import { Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import api from "../../utils/api.js";
import { useParams } from "react-router-dom";
import PlaylistCard from "../../component/cards/PlaylistCard";
import VideoCardLoading from "../../component/loadingLayouts/VideoCardLoading";
import { GET_CHANNEL_PLAYLIST } from "../../utils/constants";

const getChannelPlaylists = async ({ queryKey }) => {
  const [_key, channelId] = queryKey;
  const { data } = await api.get(`${GET_CHANNEL_PLAYLIST}/${channelId}`);
  return data?.playlists || [];
};

const ChannelPlaylist = () => {
  const params = useParams();
  const { channelId } = params;

  const {
    data: playlists,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["channelPlaylists", channelId],
    queryFn: getChannelPlaylists,
  });
  console.log("playlists", playlists);
  if (isError)
    return (
      <div> {error?.response?.data?.messgae || "Something went wrong"} </div>
    );
  if (isLoading)
    return (
      <div className=" pt-4">
        <VideoCardLoading />{" "}
      </div>
    );
  if (!playlists || !playlists.length)
    return <div className=" py-6 text-center">No playlists to show</div>;

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        "@media(max-width: 680px)": { justifyContent: "center" },
      }}
    >
      {playlists.map((playlist) => {
        // Add null checks for videos array
        const firstVideo = playlist?.videos?.[0];
        const videoId = firstVideo?._id;
        const mainThumbnail = firstVideo?.thumbnailUrl;

        return (
          <PlaylistCard
            key={playlist?._id}
            playlistId={playlist?._id}
            videoId={videoId}
            title={playlist?.name}
            videoCount={playlist?.videosCount}
            mainThumbnail={mainThumbnail}
            secondaryThumbnails={playlist?.videos || []}
          />
        );
      })}
    </Box>
  );
};

export default ChannelPlaylist;
