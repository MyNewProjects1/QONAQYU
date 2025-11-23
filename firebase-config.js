import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAGqdLmJV9LQQXvfttHdTEELJk9FIyfuUk",
  authDomain: "storage-3b1ae.firebaseapp.com",
  projectId: "storage-3b1ae",
  storageBucket: "storage-3b1ae.firebasestorage.app",
  messagingSenderId: "518333133488",
  appId: "1:518333133488:web:3d5fdb0267e4bc09e2c175",
  measurementId: "G-26FJ39R2E3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, getDocs, updateDoc, deleteDoc, doc };
