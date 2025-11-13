import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
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

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);