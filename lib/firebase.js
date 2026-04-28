import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC3CXiknfLyVTKGN5lUIxViWZ6q6j99LCI",
  authDomain: "digital-herbarium-6f3fc.firebaseapp.com",
  projectId: "digital-herbarium-6f3fc",
  storageBucket: "digital-herbarium-6f3fc.firebasestorage.app",
  messagingSenderId: "5282566566",
  appId: "1:5282566566:web:3346cc995a4b9a8c2cff67",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
