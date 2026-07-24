import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { FaShoppingCart, FaHeart, FaHistory, FaUserCog, FaGoogle, FaSync } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { auth, googleProvider, db } from "../../firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { collection, setDoc, doc } from "firebase/firestore";
import productos from "../../json/productos.json";
import "./style/MobileSidebar.css";

const MobileSidebar = ({ showSidebar, setShowSidebar, user }) => {
  const adminEmail = "facundonahuel.ciullo@gmail.com";
  const esAdmin = user?.email === adminEmail;

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setShowSidebar(false);
    } catch (error) {
      console.error("Error login:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowSidebar(false);
    } catch (error) {
      console.error("Error logout:", error);
    }
  };

  const handleActualizarProductos = async () => {
    try {
      const productosRef = collection(db, "items");
      for (const producto of productos) {
        await setDoc(doc(productosRef, String(producto.id)), producto);
      }
      alert("Productos actualizados correctamente ✔️");
      setShowSidebar(false);
    } catch (error) {
      console.error("Error actualizando productos:", error);
      alert("Error al actualizar productos ❌");
    }
  };

  return (
    <AnimatePresence>
      {showSidebar && (
        <>
          <motion.div
            className="mobile-sidebar-overlay"
            onClick={() => setShowSidebar(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />

          <motion.div
            className="mobile-sidebar-panel"
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.33, ease: "easeOut" }}
          >
            {/* HEADER */}
            <div className="sidebar-header">
              {user ? (
                <>
                  <img
                    src={user.photoURL}
                    alt="Avatar de usuario"
                    className="sidebar-avatar"
                    referrerPolicy="no-referrer"
                  />
                  <h3>{user.displayName}</h3>
                  <p>{user.email}</p>
                </>
              ) : (
                <>
                  <div className="sidebar-avatar empty-avatar" />
                  <h3>Bienvenido</h3>
                  <p>Iniciá sesión para ver tu cuenta</p>

                  <button className="google-login-btn" onClick={handleLogin} type="button">
                    <FaGoogle /> Iniciar sesión con Google
                  </button>
                </>
              )}
            </div>

            <hr className="sidebar-separator" />

            {/* ITEMS DE NAVEGACIÓN */}
            <div className="sidebar-items">
              {user && (
                <>
                  <Link to="/cart" className="sidebar-item" onClick={() => setShowSidebar(false)}>
                    <FaShoppingCart /> Carrito
                  </Link>

                  <Link to="/favoritos" className="sidebar-item" onClick={() => setShowSidebar(false)}>
                    <FaHeart /> Favoritos
                  </Link>

                  <Link to="/historial" className="sidebar-item" onClick={() => setShowSidebar(false)}>
                    <FaHistory /> Historial
                  </Link>

                  <button className="sidebar-item logout-btn" onClick={handleLogout} type="button">
                    <FiLogOut /> Cerrar sesión
                  </button>

                  {esAdmin && (
                    <>
                      <hr className="sidebar-separator" />
                      <Link to="/admin" className="sidebar-item admin-item" onClick={() => setShowSidebar(false)}>
                        <FaUserCog /> Panel de administración
                      </Link>

                      <button className="sidebar-item update-btn" onClick={handleActualizarProductos} type="button">
                        <FaSync /> Actualizar productos
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileSidebar;