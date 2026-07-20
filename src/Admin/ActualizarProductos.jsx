import React, { useState, useEffect, useContext } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import { useFavorites } from "../../context/FavoritesContext";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import { Heart, HeartFill, Plus, Dash, X, PencilSquare, CheckLg } from "react-bootstrap-icons";

// IMPORTS DE FIREBASE
import { db } from "../../firebase"; // Ajustá la ruta a tu firebase config
import { doc, updateDoc } from "firebase/firestore";

import "react-toastify/dist/ReactToastify.css";
import "./style/itemQuickView.css";

const ItemQuickView = ({ show, handleClose, producto }) => {
  const [cantidad, setCantidad] = useState(1);
  const [varianteSeleccionada, setVarianteSeleccionada] = useState(null);
  const [adicionalesSeleccionados, setAdicionalesSeleccionados] = useState([]);
  const [localFavorite, setLocalFavorite] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // ESTADOS PARA MODO ADMIN / EDICIÓN
  const { user, esAdmin } = useAuth(); // Asumimos que esAdmin viene de AuthContext
  const [modoEdicion, setModoEdicion] = useState(false);
  const [cargandoGuardado, setCargandoGuardado] = useState(false);

  // ESTADO LOCAL DE FORMULARIO DE EDICIÓN
  const [formAdmin, setFormAdmin] = useState({
    titulo: "",
    descripcion: "",
    precio: 0,
    imagen: "",
  });

  const { addItem } = useContext(CartContext);
  const { toggleFavorite, isFavorite } = useFavorites();
  const navigate = useNavigate();

  useEffect(() => {
    if (producto) {
      if (producto.variantes && producto.variantes.length > 0) {
        setVarianteSeleccionada(producto.variantes[0]);
      } else {
        setVarianteSeleccionada(null);
      }
      setAdicionalesSeleccionados([]);
      setCantidad(1);
      setLocalFavorite(user ? isFavorite(producto.id) : false);

      // Cargar datos en el formulario de admin
      setFormAdmin({
        titulo: producto.titulo || producto.nombre || "",
        descripcion: producto.descripcion || "",
        precio: producto.precio || 0,
        imagen: producto.imagen || producto.pictureUrl || "",
      });

      // Si es admin, arrancamos en modo edición automáticamente o permitimos el toggle
      setModoEdicion(Boolean(esAdmin));
    }
  }, [producto, user, isFavorite, esAdmin]);

  if (!producto) return null;

  // Manejo de cambios en el formulario Admin
  const handleInputChangeAdmin = (e) => {
    const { name, value } = e.target;
    setFormAdmin((prev) => ({
      ...prev,
      [name]: name === "precio" ? Number(value) : value,
    }));
  };

  // GUARDAR EDICIÓN EN FIREBASE FIRESTORE
  const handleGuardarCambiosFirebase = async () => {
    try {
      setCargandoGuardado(true);

      // Mismo formato de ID usado en tu script (ej: "001", "002" o el ID directo)
      const idStr = String(producto.id).padStart(3, "0");
      const docRef = doc(db, "items", idStr);

      await updateDoc(docRef, {
        titulo: formAdmin.titulo,
        descripcion: formAdmin.descripcion,
        precio: Number(formAdmin.precio),
        imagen: formAdmin.imagen,
      });

      toast.success("✅ ¡Producto actualizado en Firestore!", {
        position: "top-center",
        autoClose: 2000,
      });

      // Actualizamos visualmente las props locales
      producto.titulo = formAdmin.titulo;
      producto.descripcion = formAdmin.descripcion;
      producto.precio = Number(formAdmin.precio);
      producto.imagen = formAdmin.imagen;

      handleClose();
    } catch (error) {
      console.error("Error al actualizar producto en Firebase:", error);
      toast.error("❌ Error al guardar en la base de datos", {
        position: "top-center",
        autoClose: 2500,
      });
    } finally {
      setCargandoGuardado(false);
    }
  };

  const precioBase = varianteSeleccionada ? varianteSeleccionada.precio : (formAdmin.precio || 0);
  const precioAdicionales = adicionalesSeleccionados.reduce((total, adi) => total + (adi.precio || 0), 0);
  const precioTotal = (precioBase + precioAdicionales) * cantidad;

  const handleToggleAdicional = (adicional) => {
    setAdicionalesSeleccionados((prev) => {
      const existe = prev.find((item) => item.id === adicional.id);
      if (existe) {
        return prev.filter((item) => item.id !== adicional.id);
      } else {
        return [...prev, adicional];
      }
    });
  };

  const handleIncrementar = () => {
    const maxStock = producto.stock ?? 999;
    if (cantidad < maxStock) {
      setCantidad(prev => prev + 1);
    }
  };

  const handleDecrementar = () => {
    if (cantidad > 1) {
      setCantidad(prev => prev - 1);
    }
  };

  const handleAgregarCarrito = () => {
    if (producto.variantes?.length > 0 && !varianteSeleccionada) {
      toast.error("Seleccioná una opción de tamaño ⚠️", { position: "top-center" });
      return;
    }

    const productoParaCarrito = {
      ...producto,
      variante: varianteSeleccionada ? varianteSeleccionada.nombre : null,
      varianteId: varianteSeleccionada ? varianteSeleccionada.id : null,
      adicionales: adicionalesSeleccionados.map(a => a.nombre),
      precioUnitario: precioBase + precioAdicionales
    };

    addItem(productoParaCarrito, cantidad);
    handleClose();

    toast.success(`${producto.titulo} agregado al carrito`, {
      position: "top-center",
      autoClose: 2500,
      onClick: () => navigate("/cart"),
    });
  };

  const handleFavorito = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    const yaEsFavorito = localFavorite;
    toggleFavorite(producto);
    setLocalFavorite(!yaEsFavorito);
    const msg = yaEsFavorito ? "Eliminado de favoritos" : "Agregado a favoritos";
    toast.success(msg, { position: "top-center", autoClose: 700 });
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} centered className="iqv-modal-custom">
        <Modal.Body className="p-0">
          <div className="iqv-card-container">
            
            {/* ZONA DE IMAGEN Y BOTONES FLOTANTES */}
            <div className="iqv-image-wrapper">
              <img src={formAdmin.imagen || producto.imagen} alt={formAdmin.titulo} className="iqv-main-img" />
              
              {/* Si es Admin, mostramos botón de Editar/Cambiar Modo en la esquina superior izquierda */}
              {esAdmin ? (
                <motion.div
                  whileTap={{ scale: 1.1 }}
                  onClick={() => setModoEdicion(!modoEdicion)}
                  className="iqv-floating-fav bg-warning text-dark"
                  title="Modo Edición Admin"
                >
                  <PencilSquare size={20} />
                </motion.div>
              ) : (
                /* Favorito Arriba Izquierda (Clientes) */
                <motion.div
                  whileTap={{ scale: 1.3 }}
                  onClick={handleFavorito}
                  className="iqv-floating-fav"
                >
                  {localFavorite ? (
                    <HeartFill size={24} color="#e63946" />
                  ) : (
                    <Heart size={24} color="#ffffff" />
                  )}
                </motion.div>
              )}

              {/* Botón Cerrar Arriba Derecha */}
              <button className="iqv-floating-close" onClick={handleClose}>
                <X size={26} />
              </button>
            </div>

            {/* CONTENIDO E INFORMACIÓN */}
            <div className="iqv-body-content">

              {/* SI ES ADMIN Y ESTÁ EN MODO EDICIÓN -> MOSTRAR INPUTS */}
              {esAdmin && modoEdicion ? (
                <div className="admin-edit-fields d-flex flex-column gap-2 mb-3">
                  <span className="badge bg-warning text-dark w-auto align-self-start">
                    Modo Edición Admin ✏️
                  </span>

                  {/* Input Título */}
                  <Form.Group>
                    <Form.Label className="small text-muted mb-1">Título del Producto</Form.Label>
                    <Form.Control
                      type="text"
                      name="titulo"
                      value={formAdmin.titulo}
                      onChange={handleInputChangeAdmin}
                      className="iqv-admin-input"
                    />
                  </Form.Group>

                  {/* Input Descripción */}
                  <Form.Group>
                    <Form.Label className="small text-muted mb-1">Descripción</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="descripcion"
                      value={formAdmin.descripcion}
                      onChange={handleInputChangeAdmin}
                      className="iqv-admin-input"
                    />
                  </Form.Group>

                  {/* Input URL Imagen */}
                  <Form.Group>
                    <Form.Label className="small text-muted mb-1">URL Imagen</Form.Label>
                    <Form.Control
                      type="text"
                      name="imagen"
                      value={formAdmin.imagen}
                      onChange={handleInputChangeAdmin}
                      className="iqv-admin-input"
                    />
                  </Form.Group>

                  {/* Input Precio */}
                  <Form.Group>
                    <Form.Label className="small text-muted mb-1">Precio ($)</Form.Label>
                    <Form.Control
                      type="number"
                      name="precio"
                      value={formAdmin.precio}
                      onChange={handleInputChangeAdmin}
                      className="iqv-admin-input"
                    />
                  </Form.Group>
                </div>
              ) : (
                /* VISTA NORMAL CLIENTE */
                <>
                  <h2 className="iqv-product-title">{producto.titulo}</h2>
                  <p className="iqv-product-description">
                    {producto.descripcion || "Sin descripción disponible."}
                  </p>
                </>
              )}

              {/* VARIANTES PRINCIPALES (Tamaño / Porción) */}
              {!modoEdicion && producto.variantes?.length > 0 && (
                <div className="iqv-section-block">
                  <span className="iqv-label-text">Tamaño:</span>
                  <div className="iqv-chips-container">
                    {producto.variantes.map((v) => {
                      const isSelected = varianteSeleccionada?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          className={`iqv-chip-btn ${isSelected ? "active" : ""}`}
                          onClick={() => setVarianteSeleccionada(v)}
                        >
                          {v.nombre}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ADICIONALES (Sólo si existen) */}
              {!modoEdicion && producto.adicionales?.length > 0 && (
                <div className="iqv-section-block">
                  <span className="iqv-label-text">Agregados extra:</span>
                  <div className="iqv-adicionales-list">
                    {producto.adicionales.map((adi) => {
                      const estaSeleccionado = adicionalesSeleccionados.some((item) => item.id === adi.id);
                      return (
                        <div 
                          key={adi.id} 
                          className={`iqv-adicional-item ${estaSeleccionado ? "active" : ""}`}
                          onClick={() => handleToggleAdicional(adi)}
                        >
                          <Form.Check
                            type="checkbox"
                            id={`adi-${adi.id}`}
                            checked={estaSeleccionado}
                            onChange={() => {}}
                            label={
                              <span className="iqv-adicional-label">
                                {adi.nombre} <b className="ms-1">(${adi.precio.toLocaleString("es-AR")})</b>
                              </span>
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CANTIDAD Y PRECIO */}
              {!modoEdicion && (
                <div className="iqv-quantity-price-row">
                  <div className="iqv-qty-selector-wrapper">
                    <span className="iqv-label-text mb-0">Cantidad:</span>
                    <div className="iqv-qty-counter">
                      <button onClick={handleDecrementar} disabled={cantidad <= 1}>
                        <Dash size={20} />
                      </button>
                      <span className="iqv-qty-value">{cantidad}</span>
                      <button onClick={handleIncrementar} disabled={cantidad >= (producto.stock ?? 999)}>
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="iqv-price-display">
                    ${precioTotal.toLocaleString("es-AR")}
                  </div>
                </div>
              )}

              {/* BOTONES ACCIÓN INFERIOR */}
              <div className="iqv-footer-actions mt-3">
                {esAdmin && modoEdicion ? (
                  /* BOTÓN CONFIRMAR PARA ADMIN */
                  <button 
                    className="iqv-btn-primary-action bg-warning text-dark fw-bold border-0 d-flex align-items-center justify-content-center gap-2"
                    onClick={handleGuardarCambiosFirebase}
                    disabled={cargandoGuardado}
                  >
                    <CheckLg size={22} />
                    <span>{cargandoGuardado ? "Guardando..." : "Confirmar y Guardar en Firebase"}</span>
                  </button>
                ) : (
                  /* BOTÓN AGREGAR PARA CLIENTE */
                  <button 
                    className="iqv-btn-primary-action"
                    onClick={handleAgregarCarrito}
                    disabled={!producto.disponible}
                  >
                    {producto.disponible ? (
                      <span>Agregar</span>
                    ) : (
                      "No disponible"
                    )}
                  </button>
                )}
              </div>

            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* MODAL LOGIN */}
      <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Iniciar sesión</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <p>Debés iniciar sesión para agregar a favoritos.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLoginModal(false)}>
            Entendido
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer />
    </>
  );
};

export default ItemQuickView;