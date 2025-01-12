import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ProfileSetup from "./Profile.jsx";
import Signup from "./Signup.jsx";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProfileSetup />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/*" element={<div>no page</div>} />
      </Routes>
    </Router>
  );
};

export default App;
