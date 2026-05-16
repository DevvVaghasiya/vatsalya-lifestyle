import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCEhHagf3Tb3Cv58VSHgLituXFhWwj8Ius",
  authDomain: "textile-standard-auth.firebaseapp.com",
  projectId: "textile-standard-auth",
  storageBucket: "textile-standard-auth.firebasestorage.app",
  messagingSenderId: "286005828305",
  appId: "1:286005828305:web:b2ee273cbd0f107c3003f0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
