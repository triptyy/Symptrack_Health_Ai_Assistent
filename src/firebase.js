// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAgr7YKFkTur2FbIhTaLADplWKK-eku6vs",
  authDomain: "symptrack-7b2d0.firebaseapp.com",
  projectId: "symptrack-7b2d0",
  storageBucket: "symptrack-7b2d0.firebasestorage.app",
  messagingSenderId: "724352911472",
  appId: "1:724352911472:web:ee94e0d806b3d530300cb5",
  measurementId: "G-0J3KFKVYS9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
