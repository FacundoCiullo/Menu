import React, { useState, useEffect, useContext } from "react";
import { Modal } from "react-bootstrap";
import { CartContext } from "../../context/CartContext";
import { useFavorites } from "../../context/FavoritesContext";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { 
  Heart, 
  HeartFill, 
  Plus, 
  Dash, 
  X, 
  PencilSquare, 
  CheckLg, 
  ArrowLeft 
} from "react-bootstrap-icons";

import { db } from "../../firebase"; 
import { doc, updateDoc } from "firebase/firestore";

// Sub-componentes
import ToastModal from "../common/ToastModal";
import AdminEditForm from "../common/AdminEditForm";
import ProductOptions from "../common/ProductOptions";

import "./style/itemQuickView.css";

const ItemQuickView = ({ show, handleClose, producto }) => {
  const [cantidad, setCantidad] = useState(1);
  const [sizeSeleccionado, setSizeSeleccionado] = useState(null);
  const [additionalSeleccionados, setAdditionalSeleccionados] = useState([]);
  const [editando, setEditando] = useState(false);
  const [cargandoGuardado, setCargandoGuardado] = useState(false);
  
  const [toastConfig, setToastConfig] = useState({
    show: false,
    type: "success",
    subheading: "",
    title: "",
    message: ""
  });

  const [formAdmin, setFormAdmin] = useState({
    titulo: "",
    descripcion: "",
    precio: 0,
    imagen: "",
    size: [],
    additional: []
  });

  const { addItem } = useContext(CartContext);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { user, esAdmin } = useAuth();

  const isFav = producto ? isFavorite(producto.id) : false;

  // Manejo del botón "Atrás" en dispositivos móviles (History API)
  useEffect(() => {
    if (!show) return;

    window.history.pushState({ modalOpen: true }, "");

    const handlePopState = () => {
      handleClose();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (window.history.state?.modalOpen) {
        window.history.back();
      }
    };
  }, [show, handleClose]);

  // Reset y carga inicial de datos del producto
  useEffect(() => {
    if (producto) {
      setSizeSeleccionado(producto.size?.length > 0 ? producto.size[0] : null);
      setAdditionalSeleccionados([]);
      setCantidad(1);

      setFormAdmin({
        titulo: producto.titulo || producto.nombre || "",
        descripcion: producto.descripcion || "",
        precio: producto.precio || 0,
        imagen: producto.imagen || producto.pictureUrl || "",
        size: producto.size ? [...producto.size] : [],
        additional: producto.additional ? [...producto.additional] : []
      });

      setEditando(false);
    }
  }, [producto]);

  if (!producto) return null;

  const subcat = (producto.subcategoria || "").toLowerCase();
  const cat = (producto.categoria || "").toLowerCase();
  const type = (producto.additionalType || "").toLowerCase();

  const esSeleccionUnica = 
    type === "single" || 
    subcat.includes("pasta") || 
    cat.includes("pasta");

  // Handlers para la edición de Admin
  const handleInputChangeAdmin = (e) => {
    const { name, value } = e.target;
    setFormAdmin((prev) => ({
      ...prev,
      [name]: name === "precio" ? Number(value) : value,
    }));
  };

  const handleSizeChangeAdmin = (index, field, value) => {
    const nuevosSizes = [...formAdmin.size];
    nuevosSizes[index] = {
      ...nuevosSizes[index],
      [field]: field === "precio" ? Number(value) : value
    };
    setFormAdmin((prev) => ({ ...prev, size: nuevosSizes }));
  };

  const handleAdditionalChangeAdmin = (index, field, value) => {
    const nuevosAdditionals = [...formAdmin.additional];
    nuevosAdditionals[index] = {
      ...nuevosAdditionals[index],
      [field]: field === "precio" ? Number(value) : value
    };
    setFormAdmin((prev) => ({ ...prev, additional: nuevosAdditionals }));
  };

  const handleConfirmarActualizacion = async () => {
    try {
      setCargandoGuardado(true);
      const idStr = String(producto.id).padStart(3, "0");
      const docRef = doc(db, "items", idStr);

      const datosAActualizar = {
        titulo: formAdmin.titulo,
        descripcion: formAdmin.descripcion,
        precio: Number(formAdmin.precio),
        size: formAdmin.size,
        additional: formAdmin.additional
      };

      await updateDoc(docRef, datosAActualizar);

      // Actualizar localmente el objeto producto
      producto.titulo = formAdmin.titulo;
      producto.descripcion = formAdmin.descripcion;
      producto.precio = Number(formAdmin.precio);
      producto.size = formAdmin.size;
      producto.additional = formAdmin.additional;

      if (sizeSeleccionado) {
        const sizeActualizado = formAdmin.size.find(s => s.id === sizeSeleccionado.id);
        if (sizeActualizado) setSizeSeleccionado(sizeActualizado);
      }

      setEditando(false);

      setToastConfig({
        show: true,
        type: "success",
        subheading: "Base de Datos",
        title: "¡Producto actualizado!",
        message: "Los datos del producto se guardaron correctamente."
      });

    } catch (error) {
      console.error("Error al actualizar Firestore:", error);
      setToastConfig({
        show: true,
        type: "error",
        subheading: "Error de Guardado",
        title: "Ocurrió un problema",
        message: "No se pudieron aplicar los cambios en la base de datos."
      });
    } finally {
      setCargandoGuardado(false);
    }
  };

  // Cálculos de Precios
  const precioBase = sizeSeleccionado ? sizeSeleccionado.precio : (formAdmin.precio || 0);
  const precioAdditional = additionalSeleccionados.reduce((total, adi) => total + (adi.precio || 0), 0);
  const precioUnitarioFinal = precioBase + precioAdditional;
  const precioTotal = precioUnitarioFinal * cantidad;

  // Selección de Opciones
  const handleSelectSize = (s) => {
    setSizeSeleccionado((prev) => (prev?.id === s.id ? null : s));
  };

  const handleToggleAdditional = (extra) => {
    setAdditionalSeleccionados((prev) => {
      const yaSeleccionado = prev.some((item) => item.id === extra.id);
      if (esSeleccionUnica) {
        return yaSeleccionado ? [] : [extra];
      }
      return yaSeleccionado
        ? prev.filter((item) => item.id !== extra.id)
        : [...prev, extra];
    });
  };

  const handleIncrementar = () => {
    const maxStock = producto.stock ?? 999;
    if (cantidad < maxStock) setCantidad((prev) => prev + 1);
  };

  const handleDecrementar = () => {
    if (cantidad > 1) setCantidad((prev) => prev - 1);
  };

  const handleAgregarCarrito = () => {
    if (producto.size?.length > 0 && !sizeSeleccionado) {
      setToastConfig({
        show: true,
        type: "info",
        subheading: "Atención",
        title: "Falta seleccionar tamaño",
        message: "Por favor elegí un tamaño antes de agregar al carrito."
      });
      return;
    }

    const esRequerido = producto.additionalRequired || esSeleccionUnica;
    if (esRequerido && producto.additional?.length > 0 && additionalSeleccionados.length === 0) {
      setToastConfig({
        show: true,
        type: "info",
        subheading: "Atención",
        title: "Falta seleccionar opción",
        message: "Por favor elegí una salsa u opción adicional."
      });
      return;
    }

    const productoParaCarrito = {
      ...producto,
      precioUnitario: precioUnitarioFinal,
      sizeSeleccionado: sizeSeleccionado || null,
      additionalSeleccionados: additionalSeleccionados || []
    };

    addItem(productoParaCarrito, cantidad);
    handleClose();

    setToastConfig({
      show: true,
      type: "success",
      subheading: "Producto Agregado",
      title: "¡Agregado al carrito!",
      message: (
        <span>
          <strong>{producto.titulo}</strong> ya se encuentra en tu pedido.
        </span>
      )
    });
  };

  const handleFavorito = () => {
    if (!user) {
      setToastConfig({
        show: true,
        type: "info",
        subheading: "Atención",
        title: "Iniciá sesión",
        message: "Debés iniciar sesión para agregar productos a tus favoritos."
      });
      return;
    }

    toggleFavorite(producto);

    setToastConfig({
      show: true,
      type: "success",
      subheading: "Favoritos",
      title: isFav ? "Eliminado" : "¡Agregado!",
      message: (
        <span>
          <strong>{producto.titulo}</strong> {isFav ? "se quitó de tus favoritos." : "se guardó en tus favoritos."}
        </span>
      )
    });
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} centered className="iqv-modal-custom">
        <Modal.Body className="p-0">
          <div className="iqv-card-container">
            
            {/* Cabecera de Imagen y Botones Flotantes Superiores */}
            <div className="iqv-image-wrapper">
              <img
                src={producto.imagen || producto.pictureUrl}
                alt={formAdmin.titulo}
                className="iqv-main-img"
              />
              
              {esAdmin && (
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  type="button"
                  className={`iqv-floating-edit-btn ${editando ? "active" : ""}`}
                  onClick={() => setEditando(!editando)}
                  title={editando ? "Cancelar edición" : "Editar información de producto"}
                >
                  {editando ? <ArrowLeft size={20} /> : <PencilSquare size={20} />}
                </motion.button>
              )}

              <button type="button" className="iqv-floating-close" onClick={handleClose} aria-label="Cerrar">
                <X size={26} />
              </button>
            </div>

            {/* Cuerpo del Modal */}
            <div className="iqv-body-content">

              {esAdmin && editando ? (
                <AdminEditForm
                  formAdmin={formAdmin}
                  handleInputChangeAdmin={handleInputChangeAdmin}
                  handleSizeChangeAdmin={handleSizeChangeAdmin}
                  handleAdditionalChangeAdmin={handleAdditionalChangeAdmin}
                />
              ) : (
                <>
                  {/* Fila de Título y Botón de Favoritos */}
                  <div className="iqv-header-title-row">
                    <h2 className="iqv-product-title">{producto.titulo}</h2>
                    <motion.button
                      whileTap={{ scale: 1.25 }}
                      type="button"
                      onClick={handleFavorito}
                      className="iqv-fav-btn"
                      aria-label="Agregar a favoritos"
                    >
                      {isFav ? (
                        <HeartFill size={22} color="#EFBF04" />
                      ) : (
                        <Heart size={22} color="var(--iqv-text-secondary, #a1a1aa)" />
                      )}
                    </motion.button>
                  </div>

                  <p className="iqv-product-description">
                    {producto.descripcion || "Sin descripción disponible."}
                  </p>

                  {/* Selector de Opciones */}
                  <ProductOptions
                    producto={producto}
                    sizeSeleccionado={sizeSeleccionado}
                    handleSelectSize={handleSelectSize}
                    additionalSeleccionados={additionalSeleccionados}
                    handleToggleAdditional={handleToggleAdditional}
                    esSeleccionUnica={esSeleccionUnica}
                  />

                  {/* Fila de Cantidad y Precio Final */}
                  <div className="iqv-quantity-price-row">
                    <div className="iqv-qty-selector-wrapper">
                      <span className="iqv-label-text mb-0">Cantidad:</span>
                      <div className="iqv-qty-counter">
                        <button type="button" onClick={handleDecrementar} disabled={cantidad <= 1}>
                          <Dash size={20} />
                        </button>
                        <span className="iqv-qty-value">{cantidad}</span>
                        <button
                          type="button"
                          onClick={handleIncrementar}
                          disabled={cantidad >= (producto.stock ?? 999)}
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                    </div>

                    <div className="iqv-price-display">
                      ${precioTotal.toLocaleString("es-AR")}
                    </div>
                  </div>
                </>
              )}

              {/* Acciones Inferiores */}
              <div className="iqv-footer-actions mt-3">
                {esAdmin && editando ? (
                  <button
                    type="button"
                    className="iqv-btn-primary-action iqv-btn-admin-save"
                    onClick={handleConfirmarActualizacion}
                    disabled={cargandoGuardado}
                  >
                    <CheckLg size={22} />
                    <span>
                      {cargandoGuardado ? "Guardando..." : "Confirmar actualización"}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="iqv-btn-primary-action"
                    onClick={handleAgregarCarrito}
                    disabled={producto.disponible === false}
                  >
                    {producto.disponible !== false ? <span>Agregar</span> : "No disponible"}
                  </button>
                )}
              </div>

            </div>
          </div>
        </Modal.Body>
      </Modal>

      <ToastModal
        show={toastConfig.show}
        onHide={() => setToastConfig((prev) => ({ ...prev, show: false }))}
        type={toastConfig.type}
        subheading={toastConfig.subheading}
        title={toastConfig.title}
        message={toastConfig.message}
      />
    </>
  );
};

export default ItemQuickView;