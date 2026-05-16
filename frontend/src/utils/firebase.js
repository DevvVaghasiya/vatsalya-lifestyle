import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDyTtG8TFHa7lRBHNHw-UMmeSYm4Gdb92k",
  authDomain: "vatsalya-textile.firebaseapp.com",
  projectId: "vatsalya-textile",
  storageBucket: "vatsalya-textile.firebasestorage.app",
  messagingSenderId: "867540245457",
  appId: "1:867540245457:web:f1b0c223a625c46cf41ef0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
