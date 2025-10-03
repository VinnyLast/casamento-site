
// Initialize Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAcH1aEZXepNB8I1XD5iO7mEJiTTb4ew44",
  authDomain: "casamento-ad1e3.firebaseapp.com",
  projectId: "casamento-ad1e3",
  storageBucket: "casamento-ad1e3.firebasestorage.app",
  messagingSenderId: "785685299023",
  appId: "1:785685299023:web:2410e247f350f767a48f3a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

