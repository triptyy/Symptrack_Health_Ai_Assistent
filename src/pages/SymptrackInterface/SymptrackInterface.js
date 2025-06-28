
import { db } from "../../firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import "./SymptrackInterface.css";

function SymptrackInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [user, setUser] = useState(null);
  const [extractedSymptoms, setExtractedSymptoms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const chatEndRef = useRef(null);

  const fetchChatHistory = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setMessages(data.history || []);
      }
    } catch (err) {
      console.error("Failed to fetch chat history:", err);
    }
  };

  const saveMessageToHistory = async (message) => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        history: arrayUnion(message),
      });
    } catch (err) {
      console.error("Failed to save message:", err);
    }
  };

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      setUser(parsedUser);
      fetchChatHistory(parsedUser.id);
    }

    // Request user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Geolocation error:", error.message);
          setMessages((prev) => [
            ...prev,
            {
              text: "Unable to access location. Doctor recommendations may be unavailable.",
              sender: "system",
            },
          ]);
        }
      );
    } else {
      console.warn("Geolocation not supported");
      setMessages((prev) => [
        ...prev,
        {
          text: "Geolocation not supported in your browser. Doctor recommendations may be unavailable.",
          sender: "system",
        },
      ]);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const predictDisease = async (symptoms) => {
    try {
      const requestBody = { symptoms };
      if (location.latitude && location.longitude) {
        requestBody.latitude = location.latitude;
        requestBody.longitude = location.longitude;
      }

      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      return (
        <div className="prediction-result">
          <div className="primary-prediction">
            <strong>Most likely condition:</strong> {data.disease}
          </div>

          <div className="validated-symptoms">
            <strong>Recognized symptoms:</strong>
            <div className="symptoms-tags">
              {data.valid_symptoms?.map((symptom, i) => (
                <span key={i} className="symptom-tag">
                  {symptom}
                </span>
              ))}
            </div>
          </div>

          <div className="disease-description">
            <strong>Description:</strong> {data.description}
          </div>

          <div className="fatality-rate">
            <strong>Fatality Rate:</strong> {data.fatality_rate}
          </div>

          <div className="disease-type">
            <strong>Disease Type:</strong> {data.disease_type}
          </div>

          <div className="doctors-recommendation">
            <strong>Recommended Doctors:</strong>
            {data.doctors && data.doctors.length > 0 ? (
              <ul className="doctors-list">
                {data.doctors.map((doctor, i) => (
                  <li key={i} className="doctor-item">
                    <div><strong>Name:</strong> {doctor.name}</div>
                    <div><strong>Address:</strong> {doctor.address}</div>
                    <div><strong>Rating:</strong> {doctor.rating}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="no-doctors">
                {data.doctors_error || "No doctors found. Please ensure location access or try again later."}
              </div>
            )}
          </div>

          <div className="disclaimer">
            Note: This is not a medical diagnosis. Please consult a healthcare professional.
          </div>
        </div>
      );
    } catch (error) {
      console.error("Prediction error:", error);
      return (
        <div className="prediction-error">
          Could not make a prediction at this time. Please try again later.
        </div>
      );
    }
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in your browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setMessages((prev) => [...prev, { text: "Listening...", sender: "system" }]);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleSend(transcript);
    };

    recognition.onerror = (event) => {
      setMessages((prev) => [
        ...prev,
        {
          text: `Error: ${event.error}`,
          sender: "system",
        },
      ]);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSend = async (text) => {
    if (!text.trim()) return;

    const newMessage = { text, sender: "user" };
    setMessages((prev) => [...prev, newMessage]);
    saveMessageToHistory(newMessage);
    setIsLoading(true);
    setInput("");

    try {
      const response = await fetch("http://localhost:5005/webhooks/rest/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: user ? `user_${user.id}` : "anonymous", message: text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const botResponses = data.map((item) => ({
        text: item.text,
        sender: "bot",
        isSymptom: /symptoms?:/i.test(item.text),
      }));

      setMessages((prev) => [...prev, ...botResponses]);
      botResponses.forEach(saveMessageToHistory);

      const symptomResponse = data.find((item) => /symptoms?:/i.test(item.text));
      if (symptomResponse) {
        const symptomsText = symptomResponse.text
          .replace(/.*symptoms?:\s*/i, "")
          .split(/[,.]\s*/)
          .map((s) => s.trim())
          .filter((s) => s);

        if (symptomsText.length > 0) {
          setExtractedSymptoms((prev) => [...new Set([...prev, ...symptomsText])]);

          const prediction = await predictDisease(symptomsText);
          setMessages((prev) => [
            ...prev,
            {
              text: prediction,
              sender: "bot",
              isPrediction: true,
            },
          ]);
        }
      }
    } catch (err) {
      console.error("Chat Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, I'm having trouble connecting. Please try again.",
          sender: "bot",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <h1>
        Symptrack Assistant <span role="img" aria-label="robot">🤖</span>
      </h1>

      <div className="chat-window">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            className={`message ${msg.sender} ${msg.isSymptom ? "symptom-message" : ""} ${msg.isPrediction ? "prediction-message" : ""}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {typeof msg.text === "string" ? msg.text : msg.text}
          </motion.div>
        ))}
        {isLoading && (
          <motion.div className="message bot" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend(input)}
          placeholder="Describe your symptoms..."
          disabled={isLoading}
        />
        <button onClick={() => handleSend(input)} disabled={isLoading || !input.trim()}>
          Send
        </button>
        <button className="mic-button" onClick={startSpeechRecognition} disabled={isLoading || isListening}>
          <span role="img" aria-label="microphone">
            {isListening ? "🔴" : "🎤"}
          </span>
        </button>
      </div>

      {extractedSymptoms.length > 0 && (
        <div className="extracted-symptoms">
          <h3>Identified Symptoms:</h3>
          <div className="symptoms-list">
            {extractedSymptoms.map((symptom, index) => (
              <div key={index} className="symptom-tag">
                {symptom}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SymptrackInterface;
