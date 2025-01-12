import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ProfileSetup from "./Profile.jsx";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProfileSetup />} />
        <Route path="/*" element={<div>no page</div>} />
      </Routes>
    </Router>
  );
};

export default App;
