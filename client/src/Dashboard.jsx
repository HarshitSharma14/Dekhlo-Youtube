import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [user, setUser] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/v1/auth/user", { withCredentials: true })
      .then((response) => setUser(response.data))
      .catch(() => (window.location.href = "/"));
  }, []);

  if (!user) {
    return <h1>Loading...</h1>;
  }
  const logout = () => {
    axios
      .get("http://localhost:3000/api/v1/auth/logout", {
        withCredentials: true,
      })
      .then(() => {
        window.location.href = "/";
      })
      .catch((er) => {
        console.log("error", er);
      });
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome, {user.name}</h1>
      <p>Email: {user.email}</p>
      <button onClick={logout}>logout</button>
    </div>
  );
};

export default Dashboard;
