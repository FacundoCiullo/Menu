// src/components/layout/Sidebar.jsx
import { Offcanvas, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  BsHouseFill,
  BsBoxSeamFill,
  BsTelephoneFill,
  BsCartCheckFill,
  BsBookmarkStarFill,
} from "react-icons/bs";
import { FaBook, FaSignOutAlt, FaCog, FaGoogle, FaSync } from "react-icons/fa";

import { auth, googleProvider, db } from "../../firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";

import productos from "../../json/productos.json";
import { collection, setDoc, doc } from "firebase/firestore";

import "./style/layout.css";

const Sidebar = ({ show, onClose }) => {
  const [user] = useAuthState(auth);

  const handleLogin = async () => {
    await signInWithPopup(auth, googleProvider);
    onClose();
  };

  const handleLogout = async () => {
    await signOut(auth);
    onClose();
  };

  const adminEmail = "facundonahuel.ciullo@gmail.com";
  const esAdmin = user?.email === adminEmail;

  const handleActualizarProductos = async () => {
    try {
      const productosRef = collection(db, "items");

      for (const producto of productos) {
        await setDoc(doc(productosRef, String(producto.id)), producto);
      }

      alert("Productos actualizados correctamente en Firestore ✔️");
      onClose();
    } catch (error) {
      console.error("Error al actualizar productos:", error);
      alert("Hubo un error al actualizar los productos ❌");
    }
  };

  return (
    <Offcanvas 
      show={show} 
      onHide={onClose} 
      placement="end" 
      className="sidebar-offcanvas"
    >
      <Offcanvas.Header closeButton closeVariant="white">
        <Offcanvas.Title>Mi cuenta</Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body>
        {user ? (
          <>
            {/* Perfil */}
            <div className="text-center mb-3">
              <img 
                src={user.photoURL} 
                alt="usuario" 
                referrerPolicy="no-referrer" 
                className="sidebar-avatar" 
              />
              <h6 className="mt-2 mb-1 font-weight-bold text-white">{user.displayName}</h6>
              <p className="text-secondary small mb-0">{user.email}</p>
            </div>

            <hr className="border-subtle my-3" />

            {/* Links */}
            <Link to="/" className="sidebar-link mb-1" onClick={onClose}>
              <BsHouseFill className="me-2" /> Inicio
            </Link>

            <Link to="/Productos" className="sidebar-link mb-1" onClick={onClose}>
              <BsBoxSeamFill className="me-2" /> Productos
            </Link>

            <Link to="/Contactos" className="sidebar-link mb-1" onClick={onClose}>
              <BsTelephoneFill className="me-2" /> Contactos
            </Link>

            <hr className="border-subtle my-3" />

            <Link to="/cart" className="sidebar-link mb-1" onClick={onClose}>
              <BsCartCheckFill className="me-2" /> Carrito
            </Link>

            <Link to="/favoritos" className="sidebar-link mb-1" onClick={onClose}>
              <BsBookmarkStarFill className="me-2" /> Favoritos
            </Link>

            <Link to="/historial" className="sidebar-link mb-1" onClick={onClose}>
              <FaBook className="me-2" /> Historial
            </Link>

            {/* SOLO ADMIN */}
            {esAdmin && (
              <>
                <hr className="border-subtle my-3" />

                <Link to="/admin" className="sidebar-link mb-2" onClick={onClose}>
                  <FaCog className="me-2" /> Panel admin
                </Link>

                <Button
                  className="w-100 sidebar-btn-admin mb-2"
                  onClick={handleActualizarProductos}
                >
                  <FaSync className="me-2" /> Actualizar productos
                </Button>
              </>
            )}

            <hr className="border-subtle my-3" />

            <Button 
              className="w-100 sidebar-btn-logout" 
              onClick={handleLogout}
            >
              <FaSignOutAlt className="me-2" /> Cerrar sesión
            </Button>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-secondary mb-3">Iniciá sesión para ver tus datos.</p>
            <Button
              className="sidebar-btn-admin d-flex align-items-center justify-content-center mx-auto w-100"
              onClick={handleLogin}
            >
              <FaGoogle className="me-2" /> Iniciar sesión con Google
            </Button>
          </div>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default Sidebar;