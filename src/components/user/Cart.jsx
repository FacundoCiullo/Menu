import React, { useContext, useState } from "react";
import { CartContext } from "../../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import { auth } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Trash3Fill, Dash, Plus, ArrowLeft, CartX } from "react-bootstrap-icons";
import "./cart.css";

const Cart = () => {
  const {
    cart,
    clear,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    sumTotal,
    cartTotal,
  } = useContext(CartContext);

  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleCheckout = () => {
    if (!user) {
      setShowModal(true);
      return;
    }
    navigate("/checkout");
  };

  if (cart.length === 0) {
    return (
      <main className="cart-page d-flex align-items-center justify-content-center">
        <motion.div 
          className="empty-box"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="empty-icon-wrapper">
            <CartX size={50} />
          </div>
          <h2>Tu carrito está vacío</h2>
          <p>Explorá nuestro menú y elegí tus platos favoritos.</p>
          <Link to="/Productos" className="empty-button">
            Ver Productos
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <section className="cart-wrapper">
        <header className="cart-header">
          <div>
            <h1>Productos seleccionados</h1>
            <span className="cart-badge-count">{cartTotal()} {cartTotal() === 1 ? 'ítem' : 'ítems'}</span>
          </div>
          <div className="cart-actions">
            <Link to="/Productos" className="continue-shopping">
              <ArrowLeft size={16} />
              <span>Seguir comprando</span>
            </Link>
            <button className="clear-cart" onClick={clear}>
              Vaciar carrito
            </button>
          </div>
        </header>

        <div className="cart-grid-layout">
          {/* LISTA DE PRODUCTOS */}
          <section className="cart-items">
            <AnimatePresence>
              {cart.map((item) => {
                const itemKey = item.itemKey || item.id;
                const precioUnitario = item.precioUnitario ?? item.precio ?? 0;

                return (
                  <motion.article 
                    className="cart-card" 
                    key={itemKey}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="cart-image">
                      <img src={item.imagen} alt={item.titulo} />
                    </div>

                    <div className="cart-info">
                      <div className="cart-title">
                        <h2>
                          {item.marca && `${item.marca} `}
                          {item.titulo}
                        </h2>
                        <button
                          className="delete-button"
                          onClick={() => removeItem(itemKey)}
                          title="Eliminar producto"
                        >
                          <Trash3Fill size={16} />
                        </button>
                      </div>

                      {/* TAMAÑO SELECCIONADO */}
                      {item.sizeSeleccionado && (
                        <div className="cart-item-detail">
                          <span className="iqv-custom-badge">
                            Tamaño: <b>{item.sizeSeleccionado.nombre}</b> (${item.sizeSeleccionado.precio.toLocaleString("es-AR")})
                          </span>
                        </div>
                      )}

                      {/* ADICIONALES SELECCIONADOS */}
                      {item.additionalSeleccionados && item.additionalSeleccionados.length > 0 && (
                        <div className="cart-extras-list">
                          <span className="extras-title">Adicionales:</span>
                          <ul>
                            {item.additionalSeleccionados.map((extra, idx) => (
                              <li key={extra.id || idx}>
                                + {extra.nombre} <span>(+${extra.precio.toLocaleString("es-AR")})</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="cart-controls-row">
                        <div className="quantity-box">
                          <button
                            className="qty-button"
                            onClick={() => decreaseQuantity(itemKey)}
                            disabled={item.quantity <= 1}
                          >
                            <Dash size={16} />
                          </button>
                          <span className="quantity-number">{item.quantity}</span>
                          <button
                            className="qty-button"
                            onClick={() => increaseQuantity(itemKey)}
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <div className="subtotal-box">
                          <small>Subtotal</small>
                          <strong>
                            ${(precioUnitario * item.quantity).toLocaleString("es-AR")}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </section>

          {/* RESUMEN DE COMPRA */}
          <section className="cart-summary">
            <h3>Resumen de Compra</h3>
            <div className="summary-row">
              <span>Cantidad de productos</span>
              <strong>{cartTotal()}</strong>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row total">
              <span>Total a pagar</span>
              <strong>${sumTotal().toLocaleString("es-AR")}</strong>
            </div>

            <button className="checkout-button" onClick={handleCheckout}>
              Finalizar compra
            </button>
          </section>
        </div>
      </section>

      {/* MODAL DE INICIO DE SESIÓN */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="iqv-modal-custom">
        <Modal.Header closeButton>
          <Modal.Title className="iqv-product-title">Iniciá sesión</Modal.Title>
        </Modal.Header>
        <Modal.Body className="iqv-body-content text-center">
          <p className="iqv-product-description">
            Para finalizar tu compra necesitás iniciar sesión con tu cuenta.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 justify-content-center">
          <Button variant="secondary" onClick={() => setShowModal(false)} className="px-4 rounded-3">
            Entendido
          </Button>
        </Modal.Footer>
      </Modal>
    </main>
  );
};

export default Cart;