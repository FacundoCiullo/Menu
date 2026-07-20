// src/firebase/index.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDZoker7yL_UMHTmGSqJsj58yNGvZkDWIA",
  authDomain: "my-app-2-64f01.firebaseapp.com",
  databaseURL: "https://my-app-2-64f01-default-rtdb.firebaseio.com",
  projectId: "my-app-2-64f01",
  storageBucket: "my-app-2-64f01.firebasestorage.app",
  messagingSenderId: "1034184749913",
  appId: "1:1034184749913:web:ea881ba9d85f55442a1248",
  measurementId: "G-B5S6GZ2E5N",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Firestore
export const db = getFirestore(app);

// Auth
export const auth = getAuth(app);

// Mantener la sesión iniciada
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error configurando persistencia:", error);
});

// Provider de Google
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});