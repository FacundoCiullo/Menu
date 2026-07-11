// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signOut,
  getRedirectResult,
} from "firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [esAdmin, setEsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRedirectResult(auth).catch((error) => {
      console.error("Redirect Error:", error.code, error.message);
    });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setEsAdmin(
        currentUser?.email === "facundonahuel.ciullo@gmail.com"
      );
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        esAdmin,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};