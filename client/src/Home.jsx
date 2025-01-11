import React from "react";

const Home = () => {
  const handleLogin = () => {
    window.location.href = "http://localhost:3000/api/v1/auth/login/google";
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Sign in with Google</h1>
      <button onClick={handleLogin}>Login with Google</button>
    </div>
  );
};

export default Home;
