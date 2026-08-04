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
import { collection, writeBatch, doc } from "firebase/firestore";

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
      const batch = writeBatch(db);
      const productosRef = collection(db, "items");

      productos.forEach((producto) => {
        // Asegurar que el ID sea string
        const docId = String(producto.id || producto.docId);
        const itemRef = doc(productosRef, docId);

        // Estructuración y limpieza de datos provenientes del JSON
        const productoFormateado = {
          titulo: producto.titulo || "",
          descripcion: producto.descripcion || "",
          categoria: producto.categoria || "",
          subcategoria: producto.subcategoria || "",
          imagen: producto.imagen || "/img/edit-1.png",

          // Precios y Stock
          precio: Number(producto.precio) || 0,
          precioAnterior: producto.oferta ? Number(producto.precioAnterior) || 0 : 0,
          descuentoPorcentaje: producto.oferta ? Number(producto.descuentoPorcentaje) || 0 : 0,
          stock: Number(producto.stock ?? 999),

          // Flags y atributos booleanos
          oferta: Boolean(producto.oferta),
          nuevo: Boolean(producto.nuevo),
          masVendido: Boolean(producto.masVendido),
          recomendado: Boolean(producto.recomendado),
          vegetariano: Boolean(producto.vegetariano),
          vegano: Boolean(producto.vegano),
          sinTacc: Boolean(producto.sinTacc),
          picante: Boolean(producto.picante),
          disponible: producto.disponible !== undefined ? Boolean(producto.disponible) : true,

          // Tamaños / Variantes si existen en el JSON
          ...(Array.isArray(producto.size) && producto.size.length > 0 && {
            size: producto.size.map((s) => ({
              id: s.id || s.nombre?.toLowerCase().trim().replace(/\s+/g, "_") || "",
              nombre: s.nombre || "",
              precio: Number(s.precio) || 0,
            })),
          }),

          // Adicionales si existen en el JSON
          ...(Array.isArray(producto.additional) && producto.additional.length > 0 && {
            additional: producto.additional.map((a) => ({
              id: a.id || a.nombre?.toLowerCase().trim().replace(/\s+/g, "_") || "",
              nombre: a.nombre || "",
              precio: Number(a.precio) || 0,
            })),
            additionalType: producto.additionalType || "multiple",
            additionalRequired: Boolean(producto.additionalRequired),
          }),
        };

        // { merge: true } es fundamental para actualizar sin borrar campos existentes en Firestore
        batch.set(itemRef, productoFormateado, { merge: true });
      });

      // Ejecutar la actualización masiva de una sola vez
      await batch.commit();

      alert("Productos actualizados correctamente en Firestore ✔️");
      onClose();
    } catch (error) {
      console.error("Error al actualizar productos:", error);
      alert("Hubo un error al actualizar los productos ❌: " + error.message);
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