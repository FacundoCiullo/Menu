import React, { useState, useEffect, useContext } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import { useFavorites } from "../../context/FavoritesContext";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import { Heart, HeartFill, Plus, Dash, X, PencilSquare, CheckLg, ArrowLeft } from "react-bootstrap-icons";

// IMPORTS DE FIREBASE
import { db } from "../../firebase"; 
import { doc, updateDoc } from "firebase/firestore";

import "react-toastify/dist/ReactToastify.css";
import "./style/itemQuickView.css";

const ItemQuickView = ({ show, handleClose, producto }) => {
  // =========================================================================
  // 1. DECLARACIÓN DE HOOKS (SIEMPRE ARRIBA DE TODO)
  // =========================================================================
  const [cantidad, setCantidad] = useState(1);
  const [varianteSeleccionada, setVarianteSeleccionada] = useState(null);
  const [adicionalesSeleccionados, setAdicionalesSeleccionados] = useState([]);
  const [localFavorite, setLocalFavorite] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Estados de edición Admin
  const [editando, setEditando] = useState(false);
  const [cargandoGuardado, setCargandoGuardado] = useState(false);
  
  // Estado del formulario Admin (incluye variantes y adicionales)
  const [formAdmin, setFormAdmin] = useState({
    titulo: "",
    descripcion: "",
    precio: 0,
    imagen: "",
    variantes: [],
    adicionales: []
  });

  // Contextos y Navegación
  const { addItem } = useContext(CartContext);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { user, esAdmin } = useAuth();
  const navigate = useNavigate();

  // EFECTO DE CARGA Y ACTUALIZACIÓN DE ESTADOS
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

      // Cargar datos actuales en el estado del admin (creando copias profundas de arrays)
      setFormAdmin({
        titulo: producto.titulo || producto.nombre || "",
        descripcion: producto.descripcion || "",
        precio: producto.precio || 0,
        imagen: producto.imagen || producto.pictureUrl || "",
        variantes: producto.variantes ? [...producto.variantes] : [],
        adicionales: producto.adicionales ? [...producto.adicionales] : []
      });

      setEditando(false);
    }
  }, [producto, user, isFavorite]);

  // =========================================================================
  // 2. RETORNO ANTICIPADO (DESPUÉS DE LOS HOOKS)
  // =========================================================================
  if (!producto) return null;

  // =========================================================================
  // 3. FUNCIONES DE LÓGICA Y EDICIÓN
  // =========================================================================

  // Inputs principales (Título, Descripción, Precio Base)
  const handleInputChangeAdmin = (e) => {
    const { name, value } = e.target;
    setFormAdmin((prev) => ({
      ...prev,
      [name]: name === "precio" ? Number(value) : value,
    }));
  };

  // Edición de Variantes (Tamaños)
  const handleVariantChangeAdmin = (index, field, value) => {
    const nuevasVariantes = [...formAdmin.variantes];
    nuevasVariantes[index] = {
      ...nuevasVariantes[index],
      [field]: field === "precio" ? Number(value) : value
    };
    setFormAdmin((prev) => ({ ...prev, variantes: nuevasVariantes }));
  };

  // Edición de Adicionales (Extras)
  const handleAdicionalChangeAdmin = (index, field, value) => {
    const nuevosAdicionales = [...formAdmin.adicionales];
    nuevosAdicionales[index] = {
      ...nuevosAdicionales[index],
      [field]: field === "precio" ? Number(value) : value
    };
    setFormAdmin((prev) => ({ ...prev, adicionales: nuevosAdicionales }));
  };

  // Actualización en Firestore
  const handleConfirmarActualizacion = async () => {
    try {
      setCargandoGuardado(true);

      const idStr = String(producto.id).padStart(3, "0");
      const docRef = doc(db, "items", idStr);

      const datosAActualizar = {
        titulo: formAdmin.titulo,
        descripcion: formAdmin.descripcion,
        precio: Number(formAdmin.precio),
        variantes: formAdmin.variantes,
        adicionales: formAdmin.adicionales
      };

      await updateDoc(docRef, datosAActualizar);

      toast.success("✅ ¡Información del producto actualizada!", {
        position: "top-center",
        autoClose: 2000,
      });

      // Actualizamos la referencia local del producto
      producto.titulo = formAdmin.titulo;
      producto.descripcion = formAdmin.descripcion;
      producto.precio = Number(formAdmin.precio);
      producto.variantes = formAdmin.variantes;
      producto.adicionales = formAdmin.adicionales;

      // Si había una variante seleccionada, actualizamos su valor de referencia
      if (varianteSeleccionada) {
        const varianteActualizada = formAdmin.variantes.find(v => v.id === varianteSeleccionada.id);
        if (varianteActualizada) setVarianteSeleccionada(varianteActualizada);
      }

      setEditando(false);
    } catch (error) {
      console.error("Error al actualizar Firestore:", error);
      toast.error("❌ Ocurrió un error al guardar los datos", {
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
      return existe
        ? prev.filter((item) => item.id !== adicional.id)
        : [...prev, adicional];
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
    if (producto.variantes?.length > 0 && !varianteSeleccionada) {
      toast.error("Seleccioná una opción de tamaño ⚠️", { position: "top-center" });
      return;
    }

    const productoParaCarrito = {
      ...producto,
      variante: varianteSeleccionada ? varianteSeleccionada.nombre : null,
      varianteId: varianteSeleccionada ? varianteSeleccionada.id : null,
      adicionales: adicionalesSeleccionados.map((a) => a.nombre),
      precioUnitario: precioBase + precioAdicionales,
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

  // =========================================================================
  // 4. VISTA COMPONENTE
  // =========================================================================
  return (
    <>
      <Modal show={show} onHide={handleClose} centered className="iqv-modal-custom">
        <Modal.Body className="p-0">
          <div className="iqv-card-container">
            
            {/* IMAGEN Y BOTONES FLOTANTES */}
            <div className="iqv-image-wrapper">
              <img
                src={producto.imagen}
                alt={formAdmin.titulo}
                className="iqv-main-img"
              />
              
              {esAdmin && (
                <motion.button
                  whileTap={{ scale: 1.1 }}
                  type="button"
                  className={`iqv-floating-edit-btn ${editando ? "active" : ""}`}
                  onClick={() => setEditando(!editando)}
                  title={editando ? "Cancelar edición" : "Editar información de producto"}
                >
                  {editando ? <ArrowLeft size={20} color="#fff" /> : <PencilSquare size={20} color="#fff" />}
                </motion.button>
              )}

              {!esAdmin && (
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

              <button className="iqv-floating-close" onClick={handleClose}>
                <X size={26} />
              </button>
            </div>

            {/* CONTENIDO DEL PRODUCTO */}
            <div className="iqv-body-content">

              {/* MODO EDICIÓN ADMIN */}
              {esAdmin && editando ? (
                <div className="iqv-admin-form-container d-flex flex-column gap-3">
                  <div className="d-flex align-items-center justify-content-between border-bottom border-secondary pb-2 mb-1">
                    <span className="badge bg-warning text-dark fw-bold">
                      Modo Edición Activado ✏️
                    </span>
                    <small className="text-muted">Edición de datos y precios</small>
                  </div>

                  {/* Campo Título */}
                  <Form.Group>
                    <Form.Label className="iqv-input-label">Título del Producto</Form.Label>
                    <Form.Control
                      type="text"
                      name="titulo"
                      value={formAdmin.titulo}
                      onChange={handleInputChangeAdmin}
                      className="iqv-editable-input"
                    />
                  </Form.Group>

                  {/* Campo Descripción */}
                  <Form.Group>
                    <Form.Label className="iqv-input-label">Descripción</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="descripcion"
                      value={formAdmin.descripcion}
                      onChange={handleInputChangeAdmin}
                      className="iqv-editable-input"
                    />
                  </Form.Group>

                  {/* Campo Precio Base */}
                  <Form.Group>
                    <Form.Label className="iqv-input-label">Precio Base ($)</Form.Label>
                    <Form.Control
                      type="number"
                      name="precio"
                      value={formAdmin.precio}
                      onChange={handleInputChangeAdmin}
                      className="iqv-editable-input"
                    />
                  </Form.Group>

                  {/* EDICIÓN DE VARIANTES (TAMAÑOS) */}
                  {formAdmin.variantes && formAdmin.variantes.length > 0 && (
                    <div className="iqv-section-block border p-2 rounded">
                      <span className="iqv-label-text fw-bold text-warning">Precios por Tamaño (Variantes):</span>
                      <div className="d-flex flex-column gap-2 mt-2">
                        {formAdmin.variantes.map((v, idx) => (
                          <div key={v.id || idx} className="d-flex gap-2 align-items-center">
                            <Form.Control
                              type="text"
                              value={v.nombre}
                              onChange={(e) => handleVariantChangeAdmin(idx, "nombre", e.target.value)}
                              placeholder="Nombre"
                              className="iqv-editable-input"
                            />
                            <Form.Control
                              type="number"
                              value={v.precio}
                              onChange={(e) => handleVariantChangeAdmin(idx, "precio", e.target.value)}
                              placeholder="Precio $"
                              className="iqv-editable-input"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* EDICIÓN DE ADICIONALES (EXTRAS) */}
                  {formAdmin.adicionales && formAdmin.adicionales.length > 0 && (
                    <div className="iqv-section-block border p-2 rounded">
                      <span className="iqv-label-text fw-bold text-warning">Precios de Agregados (Extras):</span>
                      <div className="d-flex flex-column gap-2 mt-2">
                        {formAdmin.adicionales.map((adi, idx) => (
                          <div key={adi.id || idx} className="d-flex gap-2 align-items-center">
                            <Form.Control
                              type="text"
                              value={adi.nombre}
                              onChange={(e) => handleAdicionalChangeAdmin(idx, "nombre", e.target.value)}
                              placeholder="Extra"
                              className="iqv-editable-input"
                            />
                            <Form.Control
                              type="number"
                              value={adi.precio}
                              onChange={(e) => handleAdicionalChangeAdmin(idx, "precio", e.target.value)}
                              placeholder="Precio $"
                              className="iqv-editable-input"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                /* VISTA NORMAL DE LECTURA */
                <>
                  <h2 className="iqv-product-title">{producto.titulo}</h2>
                  <p className="iqv-product-description">
                    {producto.descripcion || "Sin descripción disponible."}
                  </p>

                  {/* VARIANTES / TAMAÑOS */}
                  {producto.variantes?.length > 0 && (
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

                  {/* ADICIONALES / EXTRAS */}
                  {producto.adicionales?.length > 0 && (
                    <div className="iqv-section-block">
                      <span className="iqv-label-text">Agregados extra:</span>
                      <div className="iqv-adicionales-list">
                        {producto.adicionales.map((adi) => {
                          const estaSeleccionado = adicionalesSeleccionados.some(
                            (item) => item.id === adi.id
                          );
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
                                    {adi.nombre}{" "}
                                    <b className="ms-1">
                                      (${adi.precio.toLocaleString("es-AR")})
                                    </b>
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
                  <div className="iqv-quantity-price-row">
                    <div className="iqv-qty-selector-wrapper">
                      <span className="iqv-label-text mb-0">Cantidad:</span>
                      <div className="iqv-qty-counter">
                        <button onClick={handleDecrementar} disabled={cantidad <= 1}>
                          <Dash size={20} />
                        </button>
                        <span className="iqv-qty-value">{cantidad}</span>
                        <button
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

              {/* BOTONES DE ACCIÓN */}
              <div className="iqv-footer-actions mt-3">
                {esAdmin && editando ? (
                  <button
                    type="button"
                    className="iqv-btn-primary-action bg-warning text-dark fw-bold border-0 d-flex align-items-center justify-content-center gap-2"
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
                    disabled={!producto.disponible}
                  >
                    {producto.disponible ? <span>Agregar</span> : "No disponible"}
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