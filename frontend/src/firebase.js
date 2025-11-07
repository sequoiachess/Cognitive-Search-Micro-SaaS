// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBYvHTmX8zHTsd1YInninxKvYzTrXqh6f8",
  authDomain: "cognitive-search-cbc20.firebaseapp.com",
  projectId: "cognitive-search-cbc20",
  storageBucket: "cognitive-search-cbc20.firebasestorage.app",
  messagingSenderId: "739665787717",
  appId: "1:739665787717:web:fa25638f6aeae2658b9c2c",
  measurementId: "G-4WXZL800CN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
