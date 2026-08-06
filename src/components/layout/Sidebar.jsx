// src/components/layout/Sidebar.jsx
import { Offcanvas } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaShoppingCart,
  FaHeart,
  FaHistory,
  FaUserCog,
  FaGoogle,
  FaSync,
} from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";

import { auth, googleProvider, db } from "../../firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";

import productos from "../../json/productos.json";
import { collection, writeBatch, doc } from "firebase/firestore";

import "./style/layout.css";

const Sidebar = ({ show, onClose }) => {
  const [user] = useAuthState(auth);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (error) {
      console.error("Error login:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onClose();
    } catch (error) {
      console.error("Error logout:", error);
    }
  };

  const adminEmail = "facundonahuel.ciullo@gmail.com";
  const esAdmin = user?.email === adminEmail;

  const handleActualizarProductos = async () => {
    try {
      const batch = writeBatch(db);
      const productosRef = collection(db, "items");

      productos.forEach((producto) => {
        // Garantizar que la clave sea String para el ID de documento
        const docId = String(producto.id || producto.docId);
        const itemRef = doc(productosRef, docId);

        // Normalización y estructuración completa de campos
        const productoFormateado = {
          titulo: producto.titulo || "",
          descripcion: producto.descripcion || "",
          categoria: producto.categoria || "",
          subcategoria: producto.subcategoria || "",
          imagen: producto.imagen || "/img/edit-1.png",

          // Precios y Stock
          precio: Number(producto.precio) || 0,
          precioAnterior: producto.oferta
            ? Number(producto.precioAnterior) || 0
            : 0,
          descuentoPorcentaje: producto.oferta
            ? Number(producto.descuentoPorcentaje) || 0
            : 0,
          stock: Number(producto.stock ?? 999),

          // Flags y estados
          oferta: Boolean(producto.oferta),
          nuevo: Boolean(producto.nuevo),
          masVendido: Boolean(producto.masVendido),
          recomendado: Boolean(producto.recomendado),
          vegetariano: Boolean(producto.vegetariano),
          vegano: Boolean(producto.vegano),
          sinTacc: Boolean(producto.sinTacc),
          picante: Boolean(producto.picante),
          disponible:
            producto.disponible !== undefined
              ? Boolean(producto.disponible)
              : true,

          // Estructuras complejas: Variantes y Adicionales
          ...(Array.isArray(producto.size) &&
            producto.size.length > 0 && {
              size: producto.size.map((s) => ({
                id:
                  s.id ||
                  s.nombre?.toLowerCase().trim().replace(/\s+/g, "_") ||
                  "",
                nombre: s.nombre || "",
                precio: Number(s.precio) || 0,
              })),
            }),

          ...(Array.isArray(producto.additional) &&
            producto.additional.length > 0 && {
              additional: producto.additional.map((a) => ({
                id:
                  a.id ||
                  a.nombre?.toLowerCase().trim().replace(/\s+/g, "_") ||
                  "",
                nombre: a.nombre || "",
                precio: Number(a.precio) || 0,
              })),
              additionalType: producto.additionalType || "multiple",
              additionalRequired: Boolean(producto.additionalRequired),
            }),
        };

        // Usa merge: true para no borrar campos adicionales existentes en Firestore
        batch.set(itemRef, productoFormateado, { merge: true });
      });

      // Ejecuta todas las actualizaciones en una sola transacción batch
      await batch.commit();

      alert("¡Todos los productos y sus atributos se actualizaron correctamente! ✔️");
      onClose();
    } catch (error) {
      console.error("Error al actualizar la colección de productos:", error);
      alert("Error al actualizar productos ❌: " + error.message);
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
        <Offcanvas.Title className="fw-bold">Mi cuenta</Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body className="d-flex flex-column justify-content-between p-4">
        <div>
          {/* HEADER DEL SIDEBAR */}
          <div className="sidebar-header text-center mb-3">
            {user ? (
              <>
                <img
                  src={user.photoURL}
                  alt="Avatar de usuario"
                  className="sidebar-avatar"
                  referrerPolicy="no-referrer"
                />
                <h3 className="fs-5 fw-bold text-white mb-0">{user.displayName}</h3>
                <p className="text-secondary small mb-0">{user.email}</p>
              </>
            ) : (
              <>
                <div className="sidebar-avatar empty-avatar mx-auto" />
                <h3 className="fs-5 fw-bold text-white mb-1">Bienvenido</h3>
                <p className="text-secondary small mb-3">
                  Iniciá sesión para ver tu cuenta
                </p>

                <button
                  className="google-login-btn"
                  onClick={handleLogin}
                  type="button"
                >
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
                <Link to="/cart" className="sidebar-item" onClick={onClose}>
                  <FaShoppingCart /> Carrito
                </Link>

                <Link to="/favoritos" className="sidebar-item" onClick={onClose}>
                  <FaHeart /> Favoritos
                </Link>

                <Link to="/historial" className="sidebar-item" onClick={onClose}>
                  <FaHistory /> Historial
                </Link>

                <button
                  className="sidebar-item logout-btn"
                  onClick={handleLogout}
                  type="button"
                >
                  <FiLogOut /> Cerrar sesión
                </button>

                {esAdmin && (
                  <>
                    <hr className="sidebar-separator" />
                    <Link
                      to="/admin"
                      className="sidebar-item admin-item"
                      onClick={onClose}
                    >
                      <FaUserCog /> Panel de administración
                    </Link>

                    <button
                      className="sidebar-item update-btn"
                      onClick={handleActualizarProductos}
                      type="button"
                    >
                      <FaSync /> Actualizar productos
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default Sidebar;