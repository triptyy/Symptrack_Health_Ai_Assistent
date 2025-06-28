import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import About from "./pages/About/About";
import Doctor from "./pages/Doctor/Doctor";
import SymptrackInterface from "./pages/SymptrackInterface/SymptrackInterface"; 

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/doctor" element={<Doctor />} />
      <Route path="/symptrack-interface" element={<SymptrackInterface />} />
    </Routes>
  );
}

export default App;
