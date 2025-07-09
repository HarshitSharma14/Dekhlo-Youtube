import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { SEARCH_VIDEO_ROUTE } from "../../utils/constants";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import LongVideoCard from "../../component/cards/LongVideoCard";

const SearchPage = () => {
  console.log("in search page");

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchText = searchParams.get("s");

  const [cursor, setCursor] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const lastElementRef = useRef(null);

  const navigate = useNavigate();

  const getSearchResults = async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    try {
      console.log(searchText);
      const { data } = await axios.get(SEARCH_VIDEO_ROUTE, {
        params: { searchText, cursor },
      });
      console.log(data);
      if (data.results.length > 0) {
        setVideos((videos) => [...videos, ...data.results]);
        setCursor(data.results[data.results.length - 1]?._id);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("one");

    // setVideos([]) // Reset videos when search text changes
    // setCursor(null) // Reset cursor when search text changes
    // setHasMore(true) // Reset hasMore when search text changes
    // setLoading(false) // Reset loading when search text changes
    // lastElementRef.current = null // Reset lastElementRef when search text changes
    getSearchResults();
  }, [searchText]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        getSearchResults(); // Fetch more data when last item appears
        console.log("innnn");
      }
    });

    if (lastElementRef.current) observer.observe(lastElementRef.current);
    return () => observer.disconnect();
  }, [videos]); // Re-run when videos change

  const navigateToVideo = (videoIdNew) => {
    console.log("navingatinggggggggggggggggggggg");
    navigate(`/video-player/${videoIdNew}`);
    setTimeout(() => {
      navigate(0); // Force page reload (not recommended but works)
    }, 0);
    return;
  };

  return (
    <div className="max-w-[1200px] mx-auto mt-5">
      {videos.map((video, index) => (
        <div
          key={video._id}
          onClick={() => navigateToVideo(video._id)}
          ref={index === videos.length - 1 ? lastElementRef : null}
        >
          <LongVideoCard video={video} />
        </div>
      ))}
      {loading && (
        <div className="flex justify-center items-center mt-5">Loading...</div>
      )}
      {!hasMore && (
        <div className="flex justify-center items-center mt-5">
          No more videos to show.
        </div>
      )}
    </div>
  );
};

export default SearchPage;
