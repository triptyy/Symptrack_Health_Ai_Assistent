import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/about">About Us</Link>
        </div>
        <div className="navbar-right">
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
        </div>
      </nav>

      <div className="main-content">
        <div className="left-section">
          <h1>Welcome to SympTrack</h1>
          <div className="feature-summary">
            <h2>Intelligent Health Diagnosis Assistant</h2>
            <p>
              Chat with our AI bot via voice or text to diagnose symptoms and predict diseases.
              Find the right doctor based on your symptoms.
            </p>
            <p>
              Store your medical history for tailored guidance and find nearby specialists effortlessly.
              Experience seamless, natural interactions with advanced text-to-speech capabilities.
            </p>
            <p className="tagline">Your health, simplified!</p>
          </div>

          
          <div className="image-grid">
            <div className="image-card">
              <Link to="/symptrack-interface">
                <img src="/images/chatbot.png" alt="Symptrack Interface" />
                <p>Symptrack Interface</p>
              </Link>
            </div>
          </div>
        </div>

        <div className="right-section">
          <img src="/images/bot.png" alt="AI Bot" className="bot-image" />
        </div>
      </div>
    </div>
  );
}

export default Home;
