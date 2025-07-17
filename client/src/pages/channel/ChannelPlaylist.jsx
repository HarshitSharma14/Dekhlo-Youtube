import { Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "react-router-dom";
import PlaylistCard from "../../component/cards/PlaylistCard";
import VideoCardLoading from "../../component/loadingLayouts/VideoCardLoading";
import { GET_CHANNEL_PLAYLIST } from "../../utils/constants";

const getChannelPlaylists = async ({ queryKey }) => {
  const [_key, channelId] = queryKey;
  const { data } = await axios.get(`${GET_CHANNEL_PLAYLIST}/${channelId}`, {
    withCredentials: true,
  });
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
  if (!playlists.length)
    return <div className=" py-6 text-center">No playlists to show</div>;

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        "@media(max-width: 680px)": { justifyContent: "center" },
      }}
    >
      {playlists.map((playlist) => (
        <PlaylistCard
          key={playlist?._id}
          playlistId={playlist?._id}
          videoId={playlist.videos[0]?._id}
          title={playlist?.name}
          videoCount={playlist?.videosCount}
          mainThumbnail={playlist?.videos[0]?.thumbnailUrl}
          secondaryThumbnails={playlist?.videos}
        />
      ))}
    </Box>
  );
};

export default ChannelPlaylist;
