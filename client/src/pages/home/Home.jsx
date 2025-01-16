import React, { useEffect, useRef } from "react";
import { server } from "../../utils/constants";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppStore } from "../../store";


const Home = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [dp, setDp] = useState("");

  const { channelInfo, setChannelInfo } = useAppStore()

  useEffect(() => {
    try {
      axios
        .get(`${server}/channel/get-info`, { withCredentials: true })
        .then((res) => {
          // console.log(res.data);
          setChannelInfo(res.data)
          // console.log(channelInfo)

          setName(res.data.channelName);
          setDp(res.data.profilePhoto);
        });


    } catch (err) {
      console.log(err);
    }
  }, []);


  // const handleUploadFileButtonClick = () => {
  //   fileUploadRef.current.click()
  // }

  // const handleFileUpload = async (e) => {
  //   const file = e.target.files[0];
  //   if(file){
  //     navigate('/update-video', { file: { file } }); // Pass the file using state
  //   }
  //   else{
  //     toast.error("File not selected")
  //   }
  // }

  return (
    <>
      <div className="rounded-full w-[20%]">
        <img src={`${dp}`} />
      </div>
      <div>{`${name}`}</div>
      {name && (
        <div>
          <a href={`${server}/auth/logout`}>Logout</a>

          <div>
            <button onClick={() => { navigate('/update-video') }}>Upload Video</button>
            {/* <input type="file" ref={fileUploadRef} onChange={handleFileUpload} /> */}
          </div>
        </div>

      )}
      {!name && <a href="/signup">login</a>}
      <div>{channelInfo?.channelName
      }</div>
    </>
  );
};

export default Home;
