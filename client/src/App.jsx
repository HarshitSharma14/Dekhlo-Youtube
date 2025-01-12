import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ProfileSetup from "./pages/auth/ProfileSetup.jsx";
import { Toaster } from "react-hot-toast";
import Signup from "./Signup.jsx";
import Home from "./pages/home/Home.jsx";
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/*" element={<Home />} />
      </Routes>
      <Toaster position="bottom-center" />
    </Router>
  );
};

export default App;
