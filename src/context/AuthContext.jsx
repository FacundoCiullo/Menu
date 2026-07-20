// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";


// Creamos el contexto
const AuthContext = createContext();

// Hook para usar el contexto en cualquier componente
export const useAuth = () => useContext(AuthContext);

// Proveedor de contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);       // Usuario logueado
  const [esAdmin, setEsAdmin] = useState(false); // Bandera de administrador
  const [loading, setLoading] = useState(true);  // Control de carga inicial

  useEffect(() => {
    // Escucha cambios de estado en Firebase Auth (login, logout)
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      // Si hay usuario, verificamos si es admin
      if (currentUser) {
        const adminEmail = "facundonahuel.ciullo@gmail.com"; // tu email de admin
        setEsAdmin(currentUser.email === adminEmail);
      } else {
        setEsAdmin(false);
      }

      setLoading(false); // Dejamos de cargar
    });

    // Limpiamos el listener al desmontar
    return unsubscribe;
  }, []);

  // Función para cerrar sesión
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Valor que se pasará a todos los componentes que consuman el contexto
  return (
    <AuthContext.Provider value={{ user, esAdmin, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
