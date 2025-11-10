// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyBGgBv2BSyiNlFqFMKHPOztJBObIQffHUk",
  authDomain: "authentication-45947.firebaseapp.com",
  projectId: "authentication-45947",
  storageBucket: "authentication-45947.firebasestorage.app",
  messagingSenderId: "475398880665",
  appId: "1:475398880665:web:10b9e8ddc172ca63cda708",
  measurementId: "G-L2LG9ZMSEJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const auth = getAuth(app)
export const db = getFirestore(app)