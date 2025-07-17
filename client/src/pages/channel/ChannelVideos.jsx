import { Box, Button, CircularProgress } from "@mui/material";
import axios from "axios";
import { useOutletContext, useParams } from "react-router-dom";
import VideoCard from "../../component/cards/VideoCard";
import VideoCardLoading from "../../component/loadingLayouts/VideoCardLoading";
import { useInfinteScroll } from "../../hooks/infinteScrolling";
import { GET_CHANNEL_VIDEOS } from "../../utils/constants";
import { useState } from "react";

const getVideoss = async ({ pageParam = null, queryKey }) => {
  const [_key, channelId, sort] = queryKey;

  const api = `${GET_CHANNEL_VIDEOS}/${channelId}?cursor=${JSON.stringify(
    pageParam
  )}&sortField=${sort.sf}&sortOrder=${sort.so}&limit=20`;

  const { data } = await axios.get(api, {
    withCredentials: true,
  });
  return data;
};

const ChannelVideos = () => {
  const params = useParams();
  const { channelId } = params;

  const [sortNo, setSortNo] = useState(0);
  const buttonsForSorting = ["Latest", "Popular", "Oldest"];
  const sortingFields = [
    { sf: "_id", so: -1 },
    { sf: "views", so: -1 },
    { sf: "_id", so: 1 },
  ];
  const sort = sortingFields[sortNo];

  const { data, isLoading, isError, error, isFetchingNextPage } =
    useInfinteScroll(["channelVideos", channelId, sort], getVideoss);
  const videos = data?.pages.flatMap((page) => page.videos) || [];

  if (isError)
    return (
      <div className=" py-6 text-center">
        {error?.response?.data?.message || "Something went wrong, Try again"}
      </div>
    );

  if (!isLoading && !videos.length)
    return <div className=" py-6 text-center">No videos to show</div>;

  return (
    <>
      <Box
        sx={{
          padding: "0 8%",
          mt: "12px",
          display: "flex",
          gap: "15px",
        }}
      >
        {buttonsForSorting.map((title, index) => (
          <ButtonForSorting
            key={index}
            isActive={index === sortNo}
            sortNo={index}
            title={title}
            setSortNo={setSortNo}
          />
        ))}
      </Box>

      {isLoading && (
        <div className=" pt-4">
          <VideoCardLoading />
        </div>
      )}

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          "@media(max-width: 680px)": { justifyContent: "center" },
        }}
      >
        {videos?.map((video) => (
          <VideoCard key={video?._id} video={video} />
        ))}

        {isFetchingNextPage && (
          <div className=" w-full py-3 text-center">
            <CircularProgress />
          </div>
        )}
      </Box>
    </>
  );
};

export default ChannelVideos;

const ButtonForSorting = ({ isActive = false, setSortNo, title, sortNo }) => {
  return (
    <Button
      onClick={() => setSortNo(sortNo)}
      sx={{
        bgcolor: isActive ? "white" : "#272727",
        color: isActive ? "black" : "white",
        fontSize: "12px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "7px 12px",
        mb: "4px",
        fontWeight: "bold",

        borderRadius: "10px",
        ":hover": {
          bgcolor: !isActive && "#767676",
        },
      }}
    >
      {title}
    </Button>
  );
};
