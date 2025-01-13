import React, { useEffect } from "react";
import { server } from "../../utils/constants";
import { useState } from "react";
import axios from "axios";
const Home = () => {
  const [name, setName] = useState("");
  const [dp, setDp] = useState("");

  useEffect(() => {
    try {
      axios
        .get(`${server}/channel/get-info`, { withCredentials: true })
        .then((res) => {
          console.log(res.data);
          setName(res.data.channelName);
          setDp(res.data.profilePhoto);
        });
    } catch (err) {
      console.log(err);
    }
  }, []);
  return (
    <>
      <div className="rounded-full w-[20%]">
        <img src={`${dp}`} />
      </div>
      <div>{`${name}`}</div>
      {name && (
        <div>
          <a href={`${server}/auth/logout`}>Logout</a>
        </div>
      )}
      {!name && <a href="/signup">login</a>}
    </>
  );
};

export default Home;
