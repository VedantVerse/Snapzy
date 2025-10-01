// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCKukkdPXnTVH_0rHVGBBBak0xCN4OjQzg",
  authDomain: "isoo-c1e1a.firebaseapp.com",
  projectId: "isoo-c1e1a",
  storageBucket: "isoo-c1e1a.firebasestorage.app",
  messagingSenderId: "1049193587716",
  appId: "1:1049193587716:web:60b2cfb27390a86f784151",
  measurementId: "G-G2NH2DSZCD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);