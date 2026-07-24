import React, { useState, useEffect, useContext } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import { useFavorites } from "../../context/FavoritesContext";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import { Heart, HeartFill, Plus, Dash, X, PencilSquare, CheckLg, ArrowLeft } from "react-bootstrap-icons";

import { db } from "../../firebase"; 
import { doc, updateDoc } from "firebase/firestore";

import "react-toastify/dist/ReactToastify.css";
import "./style/itemQuickView.css";

const ItemQuickView = ({ show, handleClose, producto }) => {
  const [cantidad, setCantidad] = useState(1);
  const [sizeSeleccionado, setSizeSeleccionado] = useState(null);
  const [additionalSeleccionados, setAdditionalSeleccionados] = useState([]);
  const [localFavorite, setLocalFavorite] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [editando, setEditando] = useState(false);
  const [cargandoGuardado, setCargandoGuardado] = useState(false);
  
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
  const navigate = useNavigate();

  // -------------------------------------------------------------
  // CONTROL DEL BOTÓN "ATRÁS" DEL CELULAR/NAVEGADOR
  // -------------------------------------------------------------
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

  useEffect(() => {
    if (producto) {
      if (producto.size && producto.size.length > 0) {
        setSizeSeleccionado(producto.size[0]);
      } else {
        setSizeSeleccionado(null);
      }

      setAdditionalSeleccionados([]);
      setCantidad(1);
      setLocalFavorite(user ? isFavorite(producto.id) : false);

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
  }, [producto, user, isFavorite]);

  if (!producto) return null;

  // EVALUACIÓN DE TIPO DE SELECCIÓN DE ADICIONALES
  const subcat = (producto.subcategoria || "").toLowerCase();
  const cat = (producto.categoria || "").toLowerCase();
  const type = (producto.additionalType || "").toLowerCase();

  const esSeleccionUnica = 
    type === "single" || 
    subcat.includes("pasta") || 
    cat.includes("pasta");

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

      toast.success("✅ ¡Información del producto actualizada!", {
        position: "top-center",
        autoClose: 2000,
      });

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

  const precioBase = sizeSeleccionado ? sizeSeleccionado.precio : (formAdmin.precio || 0);
  const precioAdditional = additionalSeleccionados.reduce((total, adi) => total + (adi.precio || 0), 0);
  const precioUnitarioFinal = precioBase + precioAdditional;
  const precioTotal = precioUnitarioFinal * cantidad;

  const handleSelectSize = (s) => {
    if (sizeSeleccionado?.id === s.id) {
      setSizeSeleccionado(null);
    } else {
      setSizeSeleccionado(s);
    }
  };

  // -------------------------------------------------------------
  // LÓGICA DE ADICIONALES (ÚNICA O MÚLTIPLE)
  // -------------------------------------------------------------
  const handleToggleAdditional = (extra) => {
    setAdditionalSeleccionados((prev) => {
      const yaSeleccionado = prev.some((item) => item.id === extra.id);

      // Si es selección única (por additionalType: "single" o subcategoría Pastas)
      if (esSeleccionUnica) {
        return yaSeleccionado ? [] : [extra];
      }

      // De lo contrario, Selección Múltiple (Hamburguesas, Pizzas, etc.)
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
      toast.error("Seleccioná un tamaño ⚠️", { position: "top-center" });
      return;
    }

    // Si es requerido (o si es pasta y tiene opciones disponibles)
    const esRequerido = producto.additionalRequired || esSeleccionUnica;
    if (esRequerido && producto.additional?.length > 0 && additionalSeleccionados.length === 0) {
      toast.error("Seleccioná una salsa u opción ⚠️", { position: "top-center" });
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
                  {editando ? <ArrowLeft size={20} /> : <PencilSquare size={20} />}
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
                    <Heart size={24} color="var(--iqv-text-primary, #ffffff)" />
                  )}
                </motion.div>
              )}

              <button className="iqv-floating-close" onClick={handleClose}>
                <X size={26} />
              </button>
            </div>

            <div className="iqv-body-content">

              {esAdmin && editando ? (
                <div className="iqv-admin-form-container d-flex flex-column gap-3">
                  <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-1 iqv-admin-header">
                    <span className="badge iqv-admin-badge">
                      Modo Edición Activado ✏️
                    </span>
                    <small className="iqv-admin-subtitle">Edición de datos y precios</small>
                  </div>

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

                  {formAdmin.size && formAdmin.size.length > 0 && (
                    <div className="iqv-edit-section rounded">
                      <span className="iqv-label-text fw-bold iqv-accent-text">Precios por Tamaño (Size):</span>
                      <div className="d-flex flex-column gap-2 mt-2">
                        {formAdmin.size.map((s, idx) => (
                          <div key={s.id || idx} className="d-flex gap-2 align-items-center">
                            <Form.Control
                              type="text"
                              value={s.nombre}
                              onChange={(e) => handleSizeChangeAdmin(idx, "nombre", e.target.value)}
                              placeholder="Nombre"
                              className="iqv-editable-input"
                            />
                            <Form.Control
                              type="number"
                              value={s.precio}
                              onChange={(e) => handleSizeChangeAdmin(idx, "precio", e.target.value)}
                              placeholder="Precio $"
                              className="iqv-editable-input"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {formAdmin.additional && formAdmin.additional.length > 0 && (
                    <div className="iqv-edit-section rounded">
                      <span className="iqv-label-text fw-bold iqv-accent-text">Precios de Adicionales / Salsas:</span>
                      <div className="d-flex flex-column gap-2 mt-2">
                        {formAdmin.additional.map((adi, idx) => (
                          <div key={adi.id || idx} className="d-flex gap-2 align-items-center">
                            <Form.Control
                              type="text"
                              value={adi.nombre}
                              onChange={(e) => handleAdditionalChangeAdmin(idx, "nombre", e.target.value)}
                              placeholder="Extra / Salsa"
                              className="iqv-editable-input"
                            />
                            <Form.Control
                              type="number"
                              value={adi.precio}
                              onChange={(e) => handleAdditionalChangeAdmin(idx, "precio", e.target.value)}
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
                <>
                  <h2 className="iqv-product-title">{producto.titulo}</h2>
                  <p className="iqv-product-description">
                    {producto.descripcion || "Sin descripción disponible."}
                  </p>

                  {/* SECCIÓN TAMAÑOS */}
                  {producto.size?.length > 0 && (
                    <div className="iqv-options-group mt-2">
                      <span className="iqv-group-title">
                        Tamaño:
                        {sizeSeleccionado && (
                          <small className="iqv-selected-badge ms-2">
                            ({sizeSeleccionado.nombre})
                          </small>
                        )}
                      </span>
                      <div className="iqv-options-list">
                        {producto.size.map((s) => {
                          const isSelected = sizeSeleccionado?.id === s.id;
                          return (
                            <div
                              key={s.id}
                              className={`iqv-option-card ${isSelected ? "active" : ""}`}
                              onClick={() => handleSelectSize(s)}
                            >
                              <span className="iqv-option-name">{s.nombre}</span>
                              <b className="iqv-option-price">${s.precio.toLocaleString("es-AR")}</b>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* SECCIÓN ADICIONALES / SALSAS */}
                  {producto.additional?.length > 0 && (
                    <div className="iqv-options-group mt-3">
                      <span className="iqv-group-title">
                        {esSeleccionUnica ? "Salsa / Elección:" : "Adicionales extras:"}
                        {additionalSeleccionados.length > 0 && (
                          <small className="iqv-selected-badge ms-2">
                            ({esSeleccionUnica 
                              ? additionalSeleccionados[0].nombre 
                              : `${additionalSeleccionados.length} selec.`})
                          </small>
                        )}
                      </span>
                      <div className="iqv-options-list">
                        {producto.additional.map((adi) => {
                          const estaSeleccionado = additionalSeleccionados.some(
                            (item) => item.id === adi.id
                          );
                          return (
                            <div
                              key={adi.id}
                              className={`iqv-option-card ${estaSeleccionado ? "active" : ""}`}
                              onClick={() => handleToggleAdditional(adi)}
                            >
                              <span className="iqv-option-name">{adi.nombre}</span>
                              <b className="iqv-option-price">
                                {adi.precio > 0 
                                  ? `+ $${adi.precio.toLocaleString("es-AR")}` 
                                  : "Sin cargo"}
                              </b>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

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

      <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} centered className="iqv-modal-custom">
        <Modal.Header closeButton>
          <Modal.Title className="iqv-product-title">Iniciar sesión</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center iqv-body-content">
          <p className="iqv-product-description">Debés iniciar sesión para agregar a favoritos.</p>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: "var(--iqv-bg-card)", borderColor: "var(--iqv-border)" }}>
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