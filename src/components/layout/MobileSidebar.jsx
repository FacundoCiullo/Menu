import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { FaShoppingCart, FaHeart, FaHistory, FaUserCog, FaGoogle, FaSync } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { auth, googleProvider, db } from "../../firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { collection,writeBatch, doc } from "firebase/firestore";
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
        precioAnterior: producto.oferta ? (Number(producto.precioAnterior) || 0) : 0,
        descuentoPorcentaje: producto.oferta ? (Number(producto.descuentoPorcentaje) || 0) : 0,
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
        disponible: producto.disponible !== undefined ? Boolean(producto.disponible) : true,

        // Estructuras complejas: Variantes y Adicionales
        ...(Array.isArray(producto.size) && producto.size.length > 0 && {
          size: producto.size.map(s => ({
            id: s.id || s.nombre?.toLowerCase().trim().replace(/\s+/g, "_") || "",
            nombre: s.nombre || "",
            precio: Number(s.precio) || 0
          }))
        }),

        ...(Array.isArray(producto.additional) && producto.additional.length > 0 && {
          additional: producto.additional.map(a => ({
            id: a.id || a.nombre?.toLowerCase().trim().replace(/\s+/g, "_") || "",
            nombre: a.nombre || "",
            precio: Number(a.precio) || 0
          })),
          additionalType: producto.additionalType || "multiple",
          additionalRequired: Boolean(producto.additionalRequired)
        })
      };

      // Usa merge: true para no borrar campos adicionales existentes en Firestore
      batch.set(itemRef, productoFormateado, { merge: true });
    });

    // Ejecuta todas las actualizaciones en una sola transacción batch
    await batch.commit();

    alert("¡Todos los productos y sus atributos se actualizaron correctamente! ✔️");
    setShowSidebar(false);
  } catch (error) {
    console.error("Error al actualizar la colección de productos:", error);
    alert("Error al actualizar productos ❌: " + error.message);
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