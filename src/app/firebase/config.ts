import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // ✅ Import Firestore

const firebaseConfig = {
  apiKey: "AIzaSyArmJT5Kj9fsPxiNMZausEgZE8Szb_JjJk",
  authDomain: "arsa-761d0.firebaseapp.com",
  databaseURL: "https://arsa-761d0-default-rtdb.firebaseio.com",
  projectId: "arsa-761d0",
  storageBucket: "arsa-761d0.firebasestorage.app",
  messagingSenderId: "334240302496",
  appId: "1:334240302496:web:f797124daa0400b0f810c5",
  measurementId: "G-3865R97MNE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // ✅ Initialize Firestore

export { auth, db };
