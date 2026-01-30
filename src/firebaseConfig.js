// File: src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  // --- Thay thông tin của bạn vào đây ---
  apiKey: "AIzaSyD...", 
  authDomain: "winged-ray-485505-m3.firebaseapp.com",
  projectId: "winged-ray-485505-m3",
  storageBucket: "winged-ray-485505-m3.appspot.com",
  messagingSenderId: "...",
  appId: "..."
  // --------------------------------------
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Xuất ra để dùng cho toàn bộ web
export const auth = getAuth(app);
export const storage = getStorage(app);
