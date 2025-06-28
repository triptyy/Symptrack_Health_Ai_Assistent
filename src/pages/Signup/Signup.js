
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import "./Signup.css";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        username,
        email,
        history: [],
      });

      localStorage.setItem("user", JSON.stringify({ id: user.uid, username, email }));
      navigate("/symptrack-interface");
    } catch (error) {
      console.error("Signup error:", error);
      if (error.code === "auth/email-already-in-use") {
        setError("Email is already in use. Try logging in or using a different email.");
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak. Please use at least 6 characters.");
      } else {
        setError("Failed to sign up. Please try again.");
      }
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      let googleUsername;
      if (!userDoc.exists()) {
        googleUsername = user.displayName || user.email.split("@")[0];
        await setDoc(doc(db, "users", user.uid), {
          username: googleUsername,
          email: user.email,
          history: [],
        });
      }

      const userData = userDoc.exists() ? userDoc.data() : { username: googleUsername, email: user.email };
      localStorage.setItem("user", JSON.stringify({ id: user.uid, ...userData }));
      navigate("/symptrack-interface");
    } catch (error) {
      console.error("Google signup error:", error);
      setError("Failed to sign up with Google. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      alert("Signed out successfully.");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to sign out.");
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      {isLoggedIn ? (
        <>
          <p>You are already logged in.</p>
          <button onClick={handleLogout}>Sign Out</button>
        </>
      ) : (
        <>
          <form onSubmit={handleEmailSignup}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <button type="submit">Sign Up</button>
          </form>
          <button className="google-signin" onClick={handleGoogleSignup}>
            Sign Up with Google
          </button>
          {error && <p className="error">{error}</p>}
          <p>
            Already have an account? <a href="/login">Login here</a>.
          </p>
        </>
      )}
    </div>
  );
}

export default Signup;
