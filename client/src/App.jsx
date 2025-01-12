import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Dashboard from "./Dashboard.jsx";
import ProfileSetup from "./pages/auth/ProfileSetup.jsx";
import Signup from "./Signup.jsx";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<ProfileSetup />} />
        <Route path="/*" element={<div>no page</div>} />
      </Routes>
    </Router>
  );
};

export default App;
